from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import SessionLocal
from app.models import Sample
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import os

router = APIRouter(prefix="/samples", tags=["samples"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SampleUpdate(BaseModel):
    type: Optional[str]
    technology: Optional[str]
    group: Optional[str]
    sample_id: Optional[str]
    parent_1: Optional[str]
    parent_2: Optional[str]
    species_variety: Optional[str]
    phenotype_treatment: Optional[str]
    tissue_sampled: Optional[str]
    date: Optional[str]
    data_location: Optional[str]
    file_prefix: Optional[str]
    project_leaders: Optional[str]
    project_investigators: Optional[str]
    project_id: Optional[str]
    project_details: Optional[str]
    other_notes: Optional[str]
    rdss_location: Optional[str]

class SQLQuery(BaseModel):
    query: str

@router.get("/")
def get_samples(
    type: Optional[str] = None,
    technology: Optional[str] = None,
    group: Optional[str] = None,
    project_id: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    q = db.query(Sample)
    if type:
        q = q.filter(Sample.type == type)
    if technology:
        q = q.filter(Sample.technology == technology)
    if group:
        q = q.filter(Sample.group == group)
    if project_id:
        q = q.filter(Sample.project_id == project_id)
    if search:
        q = q.filter(Sample.sample_id.contains(search) | Sample.file_prefix.contains(search))
    total = q.count()
    items = q.offset((page - 1) * page_size).limit(page_size).all()
    return {"total": total, "page": page, "page_size": page_size, "items": items}

@router.get("/prefixes")
def get_prefixes(db: Session = Depends(get_db)):
    results = db.query(Sample.file_prefix).distinct().all()
    return [r[0] for r in results if r[0] and r[0].strip() and r[0] != "."]

@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db)):
    types = [r[0] for r in db.query(Sample.type).distinct().all() if r[0]]
    techs = [r[0] for r in db.query(Sample.technology).distinct().all() if r[0]]
    groups = [r[0] for r in db.query(Sample.group).distinct().all() if r[0]]
    projects = [r[0] for r in db.query(Sample.project_id).distinct().all() if r[0]]
    return {"types": types, "technologies": techs, "groups": groups, "project_ids": projects}

@router.get("/prefix/{prefix}")
def get_by_prefix(prefix: str, db: Session = Depends(get_db)):
    samples = db.query(Sample).filter(Sample.file_prefix == prefix).all()
    if not samples:
        raise HTTPException(status_code=404, detail="No samples found for this prefix")
    return samples

@router.put("/{sample_id}")
def update_sample(sample_id: int, data: SampleUpdate, db: Session = Depends(get_db)):
    sample = db.query(Sample).filter(Sample.id == sample_id).first()
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(sample, key, value)
    db.commit()
    db.refresh(sample)
    return sample

@router.post("/query")
def run_query(body: SQLQuery, db: Session = Depends(get_db)):
    try:
        # Only allow SELECT queries for safety
        if not body.query.strip().lower().startswith("select"):
            raise HTTPException(status_code=400, detail="Only SELECT queries are allowed")
        result = db.execute(text(body.query))
        rows = [dict(row._mapping) for row in result]
        return {"rows": rows, "count": len(rows)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/compare")
def compare_tables(db: Session = Depends(get_db)):
    csv_path = os.path.join(os.path.dirname(__file__), "../../data/samples.csv")

    if not os.path.exists(csv_path):
        return {"changes": [], "message": "Original CSV not found in Lambda package"}

    # CSV column name → model field name (handles renamed columns like species/variety)
    COL_MAP = {
        "type": "type", "technology": "technology", "group": "group",
        "sample_id": "sample_id", "parent_1": "parent_1", "parent_2": "parent_2",
        "species/variety": "species_variety", "phenotype/treatment": "phenotype_treatment",
        "tissue_sampled": "tissue_sampled", "date": "date", "data_location": "data_location",
        "file_prefix": "file_prefix", "project_leaders": "project_leaders",
        "project_investigators": "project_investigators", "project_id": "project_id",
        "project_details": "project_details", "other_notes": "other_notes",
        "rdss_location": "rdss_location",
    }

    def normalize(val):
        if val is None:
            return ""
        s = str(val).strip()
        return "" if s.lower() in ("nan", "nat", "none") else s

    try:
        orig_df = pd.read_csv(csv_path, encoding="utf-8").fillna("")
    except UnicodeDecodeError:
        orig_df = pd.read_csv(csv_path, encoding="latin-1").fillna("")
    orig_df.columns = [c.strip().lower() for c in orig_df.columns]

    rds_rows = db.query(Sample).order_by(Sample.id).all()

    changes = []
    for i, rds_row in enumerate(rds_rows):
        if i >= len(orig_df):
            break
        csv_row = orig_df.iloc[i]
        diff = {}
        for csv_col, model_field in COL_MAP.items():
            orig_val = normalize(csv_row.get(csv_col, ""))
            curr_val = normalize(getattr(rds_row, model_field, ""))
            if orig_val != curr_val:
                diff[model_field] = {"original": orig_val, "updated": curr_val}
        if diff:
            changes.append({"row": i + 1, "sample_id": normalize(getattr(rds_row, "sample_id", "")), "changes": diff})

    return {"changes": changes, "total_changes": len(changes)}


from fastapi.responses import FileResponse, StreamingResponse
import csv
import io

@router.get("/download/original")
def download_original():
    path = os.path.join(os.path.dirname(__file__), "../../data/samples.csv")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Original CSV not found in Lambda package")
    return FileResponse(path, media_type="text/csv", filename="samples_original.csv")

@router.get("/download/updated")
def download_updated(db: Session = Depends(get_db)):
    samples = db.query(Sample).order_by(Sample.id).all()
    fields = [
        "type", "technology", "group", "sample_id", "parent_1", "parent_2",
        "species_variety", "phenotype_treatment", "tissue_sampled", "date",
        "data_location", "file_prefix", "project_leaders", "project_investigators",
        "project_id", "project_details", "other_notes", "rdss_location"
    ]
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(fields)
    for s in samples:
        writer.writerow([getattr(s, f) or "" for f in fields])
    buf.seek(0)
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=samples_updated.csv"}
    )
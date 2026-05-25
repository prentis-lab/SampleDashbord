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
    # Export updated table to Excel
    export_updated_excel(db)
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
    original_path = os.path.join(os.path.dirname(__file__), "../../data/samples.xlsx")
    updated_path = os.path.join(os.path.dirname(__file__), "../../data/samples_updated.xlsx")


    if not os.path.exists(updated_path):
        return {"changes": [], "message": "No updates made yet"}

    original_df = pd.read_excel(original_path).fillna("")
    updated_df = pd.read_excel(updated_path).fillna("")

    def normalize(val):
        if val is None:
            return ""
        s = str(val).strip()
        if s.lower() in ("nan", "nat", "none"):
            return ""
        if len(s) > 10 and s[10:] == " 00:00:00":
            return s[:10]
        return s

    changes = []
    for i, (orig_row, upd_row) in enumerate(zip(original_df.itertuples(), updated_df.itertuples())):
        orig_dict = {k: normalize(v) for k, v in orig_row._asdict().items()}
        upd_dict = {k: normalize(v) for k, v in upd_row._asdict().items()}

        # Skip rows where BOTH original and updated are empty
        orig_empty = all(v == "" for k, v in orig_dict.items() if k != "Index")
        upd_empty = all(v == "" for k, v in upd_dict.items() if k != "Index")
        if orig_empty and upd_empty:
            continue

        diff = {k: {"original": orig_dict[k], "updated": upd_dict[k]}
                for k in orig_dict if orig_dict[k] != upd_dict[k] and k != "Index"}
        if diff:
            changes.append({"row": i + 1, "sample_id": orig_dict.get("sample_id", ""), "changes": diff})

    return {"changes": changes, "total_changes": len(changes)}

def export_updated_excel(db: Session):
    samples = db.query(Sample).all()
    data = [{
        "type": s.type, "technology": s.technology, "group": s.group,
        "sample_id": s.sample_id, "parent_1": s.parent_1, "parent_2": s.parent_2,
        "species/variety": s.species_variety, "phenotype/treatment": s.phenotype_treatment,
        "tissue_sampled": s.tissue_sampled, "date": s.date, "data_location": s.data_location,
        "file_prefix": s.file_prefix, "project_leaders": s.project_leaders,
        "project_investigators": s.project_investigators, "project_id": s.project_id,
        "project_details": s.project_details, "other_notes": s.other_notes,
        "rdss_location": s.rdss_location
    } for s in samples]
    df = pd.DataFrame(data)
    out_path = os.path.join(os.path.dirname(__file__), "../../data/samples_updated.xlsx")
    df.to_excel(out_path, index=False)

from fastapi.responses import FileResponse

@router.get("/download/original")
def download_original():
    path = os.path.join(os.path.dirname(__file__), "../../data/samples.xlsx")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Original file not found")
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="samples.xlsx"
    )

@router.get("/download/updated")
def download_updated():
    path = os.path.join(os.path.dirname(__file__), "../../data/samples_updated.xlsx")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="No updated file yet — make an edit first")
    return FileResponse(
        path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename="samples_updated.xlsx"
    )
import pandas as pd
from app.database import SessionLocal
from app.models import Sample
import os

def load_samples():
    db = SessionLocal()

    # Only load if table is empty
    if db.query(Sample).first():
        print("Samples already loaded, skipping.")
        db.close()
        return

    file_path = os.path.join(os.path.dirname(__file__), "../../data/samples.csv")

    if not os.path.exists(file_path):
        print(f"Warning: {file_path} not found, skipping sample load.")
        db.close()
        return

    df = pd.read_csv(file_path)
    df = df.where(pd.notnull(df), None)

    for _, row in df.iterrows():
        sample = Sample(
            type=str(row.get("type", "") or ""),
            technology=str(row.get("technology", "") or ""),
            group=str(row.get("group", "") or ""),
            sample_id=str(row.get("sample_id", "") or ""),
            parent_1=str(row.get("parent_1", "") or ""),
            parent_2=str(row.get("parent_2", "") or ""),
            species_variety=str(row.get("species/variety", "") or ""),
            phenotype_treatment=str(row.get("phenotype/treatment", "") or ""),
            tissue_sampled=str(row.get("tissue_sampled", "") or ""),
            date=str(row.get("date", "") or ""),
            data_location=str(row.get("data_location", "") or ""),
            file_prefix=str(row.get("file_prefix", "") or ""),
            project_leaders=str(row.get("project_leaders", "") or ""),
            project_investigators=str(row.get("project_investigators", "") or ""),
            project_id=str(row.get("project_id", "") or ""),
            project_details=str(row.get("project_details", "") or ""),
            other_notes=str(row.get("other_notes", "") or ""),
            rdss_location=str(row.get("rdss_location", "") or ""),
        )
        db.add(sample)

    db.commit()
    db.close()
    print("Samples loaded successfully")

if __name__ == "__main__":
    load_samples()
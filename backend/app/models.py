from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    oauth_provider = Column(String(50), nullable=True)
    oauth_id = Column(String(255), nullable=True)

class Sample(Base):
    __tablename__ = "samples"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(100), nullable=True)
    technology = Column(String(100), nullable=True)
    group = Column(String(100), nullable=True)
    sample_id = Column(Text, nullable=True)
    parent_1 = Column(Text, nullable=True)
    parent_2 = Column(Text, nullable=True)
    species_variety = Column(Text, nullable=True)
    phenotype_treatment = Column(Text, nullable=True)
    tissue_sampled = Column(Text, nullable=True)
    date = Column(String(100), nullable=True)
    data_location = Column(Text, nullable=True)
    file_prefix = Column(Text, nullable=True)
    project_leaders = Column(Text, nullable=True)
    project_investigators = Column(Text, nullable=True)
    project_id = Column(String(100), nullable=True)
    project_details = Column(Text, nullable=True)
    other_notes = Column(Text, nullable=True)
    rdss_location = Column(Text, nullable=True)

class SessionLog(Base):
    __tablename__ = "session_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    email = Column(String(255), nullable=False)
    login_time = Column(DateTime, default=datetime.utcnow)
    logout_time = Column(DateTime, nullable=True)
    last_seen = Column(DateTime, nullable=True)

class Item(Base):
    __tablename__ = "items"
    __table_args__ = {"extend_existing": True}
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
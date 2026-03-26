from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    address: Mapped[str] = mapped_column(String(255), nullable=False)
    owner: Mapped[str] = mapped_column(String(200), nullable=False)
    land_plot: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    units: Mapped[list["Unit"]] = relationship(back_populates="property", cascade="all, delete-orphan")


class Unit(Base):
    __tablename__ = "units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    living_area: Mapped[float] = mapped_column(Float, nullable=False)
    rooms: Mapped[int] = mapped_column(Integer, nullable=False)
    cold_rent: Mapped[float] = mapped_column(Float, nullable=False)
    warm_rent: Mapped[float] = mapped_column(Float, nullable=False)
    is_vacant: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    property: Mapped["Property"] = relationship(back_populates="units")
    leases: Mapped[list["Lease"]] = relationship(back_populates="unit", cascade="all, delete-orphan")


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    schufa_score: Mapped[float] = mapped_column(Float, nullable=False)
    deposit: Mapped[float] = mapped_column(Float, nullable=False)
    guarantor: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    leases: Mapped[list["Lease"]] = relationship(back_populates="tenant", cascade="all, delete-orphan")


class Lease(Base):
    __tablename__ = "leases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    unit_id: Mapped[int] = mapped_column(ForeignKey("units.id"), nullable=False)
    tenant_id: Mapped[int] = mapped_column(ForeignKey("tenants.id"), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notice_period_months: Mapped[int] = mapped_column(Integer, default=3)
    is_index_linked: Mapped[bool] = mapped_column(Boolean, default=False)
    monthly_rent: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    unit: Mapped["Unit"] = relationship(back_populates="leases")
    tenant: Mapped["Tenant"] = relationship(back_populates="leases")

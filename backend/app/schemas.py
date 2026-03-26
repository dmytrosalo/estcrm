from datetime import date, datetime

from pydantic import BaseModel


# --- Auth ---
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


# --- Property ---
class PropertyBase(BaseModel):
    address: str
    owner: str
    land_plot: str


class PropertyCreate(PropertyBase):
    pass


class PropertyUpdate(PropertyBase):
    pass


class PropertyResponse(PropertyBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


# --- Unit ---
class UnitBase(BaseModel):
    property_id: int
    name: str
    living_area: float
    rooms: int
    cold_rent: float
    warm_rent: float
    is_vacant: bool = True


class UnitCreate(UnitBase):
    pass


class UnitUpdate(UnitBase):
    pass


class UnitResponse(UnitBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    property: PropertyResponse | None = None

    model_config = {"from_attributes": True}


# --- Tenant ---
class TenantBase(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    schufa_score: float
    deposit: float
    guarantor: str | None = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(TenantBase):
    pass


class TenantResponse(TenantBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


# --- Lease ---
class LeaseBase(BaseModel):
    unit_id: int
    tenant_id: int
    start_date: date
    end_date: date | None = None
    notice_period_months: int = 3
    is_index_linked: bool = False
    monthly_rent: float


class LeaseCreate(LeaseBase):
    pass


class LeaseUpdate(LeaseBase):
    pass


class LeaseResponse(LeaseBase):
    id: int
    created_at: datetime | None = None
    updated_at: datetime | None = None
    unit: UnitResponse | None = None
    tenant: TenantResponse | None = None

    model_config = {"from_attributes": True}


# --- Dashboard ---
class ChartItem(BaseModel):
    name: str
    value: float


class DashboardResponse(BaseModel):
    vacant_units: list[UnitResponse]
    overdue_leases: list[LeaseResponse]
    total_properties: int
    total_units: int
    total_tenants: int
    vacant_count: int
    overdue_count: int
    rent_by_property: list[ChartItem]
    units_by_property: list[ChartItem]
    schufa_distribution: list[ChartItem]
    occupancy: list[ChartItem]
    monthly_revenue: float
    potential_revenue: float

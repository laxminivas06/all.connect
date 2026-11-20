from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# AUTH
class LoginRequest(BaseModel):
    username: str
    password: str

class PatientRegisterRequest(BaseModel):
    full_name: str
    email: str
    mobile: str
    dob: str
    gender: str
    address: str
    city: str = "Hyderabad"
    area: str
    pincode: str
    password: str
    blood_group: Optional[str] = "B+"
    allergies: Optional[List[str]] = []
    chronic_conditions: Optional[List[str]] = []

class OrgRegisterRequest(BaseModel):
    organization_name: str
    organization_type: str  # hospital or clinic
    email: str
    phone: str
    address: str
    area: str
    pincode: str
    departments: List[str]
    password: str

# APPOINTMENT
class AppointmentPricingQuoteRequest(BaseModel):
    doctor_id: str
    organization_id: Optional[str] = None
    consultation_mode: str = "In-Person"  # In-Person or Video
    appointment_date: str
    appointment_time: str

class AppointmentCreateRequest(BaseModel):
    doctor_id: str
    organization_id: str
    appointment_date: str
    appointment_time: str
    appointment_type: str = "In-Person"
    chief_complaint: Optional[str] = None
    patient_id: Optional[str] = None  # If booked by hospital/clinic staff for walk-in

class AppointmentStatusUpdateRequest(BaseModel):
    status: str  # Pending, Confirmed, Checked In, Waiting, In Consultation, Completed, Cancelled, Rescheduled
    rescheduled_date: Optional[str] = None
    rescheduled_time: Optional[str] = None
    cancellation_reason: Optional[str] = None

# PRESCRIPTION
class MedicineItem(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: str
    instructions: Optional[str] = ""

class PrescriptionCreateRequest(BaseModel):
    appointment_id: Optional[str] = None
    patient_id: str
    diagnosis: str
    symptoms: Optional[str] = ""
    vitals: Optional[Dict[str, str]] = {}
    medicines: List[MedicineItem]
    advice: Optional[str] = ""
    follow_up_date: Optional[str] = None

class UploadPrescriptionOCRRequest(BaseModel):
    patient_id: Optional[str] = None
    doctor_name: Optional[str] = "External Physician"
    organization_name: Optional[str] = "External Clinic"
    consultation_date: Optional[str] = None
    medicines: List[MedicineItem]
    advice: Optional[str] = ""
    image_base64_or_name: Optional[str] = None

# PHARMACY & ORDERS
class QuotationRequest(BaseModel):
    prescription_id: Optional[str] = None
    medicines: List[Dict[str, Any]]
    patient_area: Optional[str] = "Malkajgiri"
    patient_city: Optional[str] = "Hyderabad"

class PharmacySubmitQuotationRequest(BaseModel):
    request_id: str
    pharmacy_id: str
    available_items: List[Dict[str, Any]]
    total_price: float
    delivery_fee: float = 0.0
    estimated_delivery_time: str = "30 mins"
    can_fulfill: bool = True
    notes: Optional[str] = ""

class OrderCreateRequest(BaseModel):
    pharmacy_id: str
    prescription_id: Optional[str] = None
    items: List[Dict[str, Any]]
    fulfillment_type: str = "Store Pickup"  # Store Pickup or Home Delivery
    delivery_address: Optional[str] = None
    notes: Optional[str] = ""

class OrderStatusUpdateRequest(BaseModel):
    status: str
    pickup_code_verify: Optional[str] = None

# OFFERS & CAMPAIGNS
class OfferCreateRequest(BaseModel):
    title: str
    category: str
    description: str
    original_price: float
    discounted_price: float
    start_date: str
    end_date: str
    applicable_departments: List[str]
    terms: Optional[str] = ""

class OfferStatusUpdateRequest(BaseModel):
    workflow_status: str  # draft, pending_review, approved, published, rejected, expired

# SUBSCRIPTION & ADMIN
class SubscriptionAssignRequest(BaseModel):
    organization_id: str
    organization_type: str  # hospital or clinic
    plan_id: str
    billing_cycle: str = "monthly"  # monthly or annual

class OrgPublishingUpdateRequest(BaseModel):
    publishing_status: str  # published or unpublished
    verification_status: Optional[str] = None  # verified, under_review, suspended
    subscription_status: Optional[str] = None

# CONSENT MANAGEMENT
class PatientConsentUpdateRequest(BaseModel):
    permitted_organizations: List[str]

class SubscriptionOverrideRequest(BaseModel):
    plan_id: str
    status: str = "active"
    billing_cycle: str = "annual"
    expires_at: Optional[str] = None


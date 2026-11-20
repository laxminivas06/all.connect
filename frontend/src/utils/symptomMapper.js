export const SYMPTOM_SPECIALITY_MAP = {
  fever: ['general medicine', 'pediatrics', 'internal medicine', 'infectious disease'],
  cough: ['general medicine', 'pulmonology', 'respiratory medicine', 'ent'],
  cold: ['general medicine', 'ent', 'pulmonology', 'pediatrics'],
  headache: ['general medicine', 'neurology'],
  migraine: ['neurology', 'general medicine'],
  chest: ['cardiology', 'pulmonology', 'cardiac sciences'],
  heart: ['cardiology', 'cardiac sciences'],
  cardiac: ['cardiology', 'cardiac sciences'],
  bone: ['orthopedics', 'joint replacement', 'spine care', 'orthopaedics'],
  joint: ['orthopedics', 'rheumatology', 'orthopaedics'],
  knee: ['orthopedics', 'orthopaedics'],
  back: ['orthopedics', 'neurology', 'orthopaedics'],
  spine: ['orthopedics', 'neurology', 'orthopaedics'],
  ortho: ['orthopedics', 'orthopaedics'],
  orthopaedics: ['orthopedics', 'orthopaedics'],
  orthopedics: ['orthopedics', 'orthopaedics'],
  fracture: ['orthopedics', 'orthopaedics'],
  skin: ['dermatology', 'cosmetology'],
  rash: ['dermatology'],
  acne: ['dermatology', 'cosmetology'],
  itching: ['dermatology'],
  eye: ['ophthalmology'],
  vision: ['ophthalmology'],
  cataract: ['ophthalmology'],
  dental: ['dentistry'],
  teeth: ['dentistry'],
  tooth: ['dentistry'],
  child: ['pediatrics', 'neonatology'],
  pediatric: ['pediatrics'],
  pediatrics: ['pediatrics'],
  baby: ['pediatrics', 'neonatology'],
  kid: ['pediatrics'],
  women: ['gynecology', 'obstetrics'],
  pregnancy: ['gynecology', 'obstetrics'],
  periods: ['gynecology'],
  gynecology: ['gynecology', 'obstetrics'],
  gynaecology: ['gynecology', 'obstetrics'],
  ent: ['ent'],
  ear: ['ent'],
  nose: ['ent'],
  throat: ['ent'],
  stomach: ['gastroenterology', 'general surgery'],
  digestion: ['gastroenterology'],
  acidity: ['gastroenterology', 'general medicine'],
  abdomen: ['gastroenterology', 'general surgery'],
  gas: ['gastroenterology', 'general medicine'],
  diabetes: ['endocrinology', 'general medicine'],
  sugar: ['endocrinology', 'general medicine'],
  thyroid: ['endocrinology'],
  nerve: ['neurology'],
  brain: ['neurology', 'neurosurgery'],
  stroke: ['neurology'],
  paralysis: ['neurology'],
  kidney: ['nephrology', 'urology'],
  urine: ['urology', 'nephrology']
};

export const matchesDoctorQuery = (doc, query) => {
  if (!query || !query.trim()) return true;
  const q = query.toLowerCase().trim();

  // 1. Exact or partial match on doctor name
  const docName = String(doc.name || doc.full_name || '').toLowerCase();
  if (docName.includes(q)) return true;

  // 2. Match on speciality or department
  const spec = String(doc.specialization || doc.specialty || '').toLowerCase();
  const dept = String(doc.department || '').toLowerCase();
  if (spec.includes(q) || dept.includes(q)) return true;

  // 3. Match on qualifications
  const quals = String(doc.qualifications || doc.qualification || '').toLowerCase();
  if (quals.includes(q)) return true;

  // 4. Match on conditions treated or keywords
  const conditions = Array.isArray(doc.conditions_treated) ? doc.conditions_treated : [];
  if (conditions.some(c => String(c).toLowerCase().includes(q))) return true;

  const keywords = Array.isArray(doc.medical_keywords) ? doc.medical_keywords : [];
  if (keywords.some(k => String(k).toLowerCase().includes(q))) return true;

  const services = Array.isArray(doc.services) ? doc.services : [];
  if (services.some(s => String(s).toLowerCase().includes(q))) return true;

  // 5. Intelligent match against symptom dictionary
  for (const [symptom, mappedSpecs] of Object.entries(SYMPTOM_SPECIALITY_MAP)) {
    if (q.includes(symptom) || (symptom.length > 3 && q.startsWith(symptom.slice(0, 4)))) {
      if (mappedSpecs.some(target => spec.includes(target) || dept.includes(target))) {
        return true;
      }
    }
  }

  return false;
};

/** Single source of truth for club contact info (footer + contact page). */
export const CONTACT_DETAILS = {
  address: 'Politeknik Negeri Malang, Jl. Soekarno Hatta No.9, Malang, Jawa Timur',
  phone: '+62 811-941-571',
  email: 'admin@polinemagolf.com',
  hours: 'Senin – Jumat, 08.00 – 17.00 WIB',
}

export const CONTACT_PHONE_HREF = `tel:${CONTACT_DETAILS.phone.replace(/[^+\d]/g, '')}`

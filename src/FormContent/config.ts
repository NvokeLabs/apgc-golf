import type { GlobalConfig } from 'payload'

import { revalidateFormContent } from './hooks/revalidateFormContent'

export const FormContent: GlobalConfig = {
  slug: 'form-content',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Event Registration',
          fields: [
            {
              name: 'eventRegistration',
              type: 'group',
              fields: [
                {
                  name: 'pageTitle',
                  type: 'text',
                  defaultValue: 'Register for',
                  admin: { description: 'Text before event name in page title' },
                },
                {
                  name: 'pageDescription',
                  type: 'text',
                  defaultValue: 'Fill out the form below to register for this event',
                },
                {
                  name: 'personalInfoHeading',
                  type: 'text',
                  defaultValue: 'Personal Information',
                },
                {
                  name: 'registrationDetailsHeading',
                  type: 'text',
                  defaultValue: 'Registration Details',
                },
                {
                  name: 'fullNameLabel',
                  type: 'text',
                  defaultValue: 'Full Name *',
                },
                {
                  name: 'fullNamePlaceholder',
                  type: 'text',
                  defaultValue: 'Enter your full name',
                },
                {
                  name: 'emailLabel',
                  type: 'text',
                  defaultValue: 'Email Address *',
                },
                {
                  name: 'emailPlaceholder',
                  type: 'text',
                  defaultValue: 'your@email.com',
                },
                {
                  name: 'phoneLabel',
                  type: 'text',
                  defaultValue: 'Phone Number',
                },
                {
                  name: 'phonePrefix',
                  type: 'text',
                  defaultValue: '+62',
                },
                {
                  name: 'phonePlaceholder',
                  type: 'text',
                  defaultValue: '8xx xxxx xxxx',
                },
                {
                  name: 'categoryLabel',
                  type: 'text',
                  defaultValue: 'Category *',
                },
                {
                  name: 'categoryPlaceholder',
                  type: 'text',
                  defaultValue: 'Select category',
                },
                {
                  name: 'notesLabel',
                  type: 'text',
                  defaultValue: 'Additional Notes',
                },
                {
                  name: 'notesPlaceholder',
                  type: 'text',
                  defaultValue: 'Any special requirements or notes...',
                },
                {
                  name: 'submitButtonText',
                  type: 'text',
                  defaultValue: 'Continue to Payment',
                },
                {
                  name: 'processingText',
                  type: 'text',
                  defaultValue: 'Processing...',
                },
                {
                  name: 'termsText',
                  type: 'textarea',
                  defaultValue:
                    'By registering, you agree to our terms and conditions. You will be redirected to complete payment securely via Xendit.',
                },
                {
                  name: 'eventSummaryTitle',
                  type: 'text',
                  defaultValue: 'Event Summary',
                },
                {
                  name: 'alumniLabel',
                  type: 'text',
                  defaultValue: 'Alumni:',
                },
              ],
            },
          ],
        },
        {
          label: 'Sponsor Registration',
          fields: [
            {
              name: 'sponsorRegistration',
              type: 'group',
              fields: [
                {
                  name: 'pageTitle',
                  type: 'text',
                  defaultValue: 'Become a Sponsor',
                },
                {
                  name: 'pageDescription',
                  type: 'textarea',
                  defaultValue:
                    'Partner with APGC Golf and connect with our community of passionate golfers and industry leaders.',
                },
                {
                  name: 'formTitle',
                  type: 'text',
                  defaultValue: 'Sponsorship Application',
                },
                {
                  name: 'formDescription',
                  type: 'textarea',
                  defaultValue:
                    'Fill out the form below and our team will contact you to discuss partnership opportunities.',
                },
                {
                  name: 'companyInfoHeading',
                  type: 'text',
                  defaultValue: 'Company Information',
                },
                {
                  name: 'contactInfoHeading',
                  type: 'text',
                  defaultValue: 'Contact Information',
                },
                {
                  name: 'sponsorshipInterestHeading',
                  type: 'text',
                  defaultValue: 'Sponsorship Interest',
                },
                {
                  name: 'companyNameLabel',
                  type: 'text',
                  defaultValue: 'Company Name *',
                },
                {
                  name: 'companyNamePlaceholder',
                  type: 'text',
                  defaultValue: 'Enter company name',
                },
                {
                  name: 'companyWebsiteLabel',
                  type: 'text',
                  defaultValue: 'Company Website',
                },
                {
                  name: 'companyWebsitePlaceholder',
                  type: 'text',
                  defaultValue: 'https://www.example.com',
                },
                {
                  name: 'contactPersonLabel',
                  type: 'text',
                  defaultValue: 'Contact Person *',
                },
                {
                  name: 'contactPersonPlaceholder',
                  type: 'text',
                  defaultValue: 'Full name',
                },
                {
                  name: 'emailLabel',
                  type: 'text',
                  defaultValue: 'Email Address *',
                },
                {
                  name: 'emailPlaceholder',
                  type: 'text',
                  defaultValue: 'contact@company.com',
                },
                {
                  name: 'phoneLabel',
                  type: 'text',
                  defaultValue: 'Phone Number *',
                },
                {
                  name: 'phonePlaceholder',
                  type: 'text',
                  defaultValue: '+62 xxx xxxx xxxx',
                },
                {
                  name: 'tierLabel',
                  type: 'text',
                  defaultValue: 'Interested Tier *',
                },
                {
                  name: 'tierPlaceholder',
                  type: 'text',
                  defaultValue: 'Select a tier',
                },
                {
                  name: 'messageLabel',
                  type: 'text',
                  defaultValue: 'Message',
                },
                {
                  name: 'messagePlaceholder',
                  type: 'text',
                  defaultValue: 'Tell us about your company and sponsorship goals...',
                },
                {
                  name: 'submitButtonText',
                  type: 'text',
                  defaultValue: 'Submit Application',
                },
                {
                  name: 'processingText',
                  type: 'text',
                  defaultValue: 'Submitting...',
                },
                {
                  name: 'footerText',
                  type: 'textarea',
                  defaultValue:
                    'Our sponsorship team will review your application and contact you within 2-3 business days.',
                },
              ],
            },
          ],
        },
        {
          label: 'Success Messages',
          fields: [
            {
              name: 'successMessages',
              type: 'group',
              fields: [
                {
                  name: 'eventRegistrationTitle',
                  type: 'text',
                  defaultValue: 'Registration Successful!',
                },
                {
                  name: 'eventRegistrationDescription',
                  type: 'textarea',
                  defaultValue:
                    'Thank you for registering. We have sent a confirmation email with payment instructions to your email address. Please check your inbox.',
                },
                {
                  name: 'whatsNextTitle',
                  type: 'text',
                  defaultValue: "What's Next?",
                },
                {
                  name: 'whatsNextDescription',
                  type: 'textarea',
                  defaultValue:
                    "Complete your payment within 48 hours to secure your spot. You'll receive a final confirmation once payment is verified.",
                },
                {
                  name: 'paymentSuccessTitle',
                  type: 'text',
                  defaultValue: 'Payment Successful!',
                },
                {
                  name: 'paymentSuccessDescription',
                  type: 'textarea',
                  defaultValue:
                    'Thank you for your registration. Your payment has been processed successfully.',
                },
                {
                  name: 'checkEmailTitle',
                  type: 'text',
                  defaultValue: 'Check your email',
                },
                {
                  name: 'checkEmailDescription',
                  type: 'textarea',
                  defaultValue:
                    'Your ticket with QR code has been sent to your email address. Please present it at the event for check-in.',
                },
                {
                  name: 'sponsorApplicationTitle',
                  type: 'text',
                  defaultValue: 'Application Submitted!',
                },
                {
                  name: 'sponsorApplicationDescription',
                  type: 'textarea',
                  defaultValue:
                    'Thank you for your interest in partnering with APGC Golf. Our sponsorship team will review your application and contact you within 2-3 business days.',
                },
                {
                  name: 'sponsorWhatsNextTitle',
                  type: 'text',
                  defaultValue: "What's Next?",
                },
                {
                  name: 'sponsorWhatsNextDescription',
                  type: 'textarea',
                  defaultValue:
                    'Our team will reach out to discuss partnership details, benefits, and customize a sponsorship package that fits your needs.',
                },
              ],
            },
          ],
        },
        {
          label: 'Error Messages',
          fields: [
            {
              name: 'errorMessages',
              type: 'group',
              fields: [
                {
                  name: 'paymentFailedTitle',
                  type: 'text',
                  defaultValue: 'Payment Failed',
                },
                {
                  name: 'paymentFailedDescription',
                  type: 'textarea',
                  defaultValue:
                    'Unfortunately, your payment could not be processed. This may be due to insufficient funds, an expired card, or a temporary issue with the payment provider.',
                },
                {
                  name: 'paymentFailedSecondary',
                  type: 'textarea',
                  defaultValue:
                    'Your registration has been saved. You can try again with a different payment method or contact us if you continue to experience issues.',
                },
                {
                  name: 'registrationFailed',
                  type: 'text',
                  defaultValue: 'Failed to submit registration. Please try again.',
                },
                {
                  name: 'eventNotFound',
                  type: 'text',
                  defaultValue: 'Event not found.',
                },
                {
                  name: 'registrationClosed',
                  type: 'text',
                  defaultValue: 'Registration for this event is currently closed.',
                },
                {
                  name: 'needHelpText',
                  type: 'text',
                  defaultValue: 'Need help?',
                },
                {
                  name: 'contactUsText',
                  type: 'text',
                  defaultValue: 'Contact us',
                },
                {
                  name: 'contactEmail',
                  type: 'text',
                  defaultValue: 'info@apgc-golf.com',
                },
              ],
            },
          ],
        },
        {
          label: 'Category Options',
          fields: [
            {
              name: 'categoryOptions',
              type: 'group',
              fields: [
                {
                  name: 'categories',
                  type: 'array',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'value',
                      type: 'text',
                      required: true,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { width: '50%' },
                    },
                  ],
                  defaultValue: [
                    { value: 'alumni', label: 'Alumni' },
                    { value: 'member', label: 'Member' },
                    { value: 'guest', label: 'Guest' },
                    { value: 'vip', label: 'VIP' },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFormContent],
  },
}

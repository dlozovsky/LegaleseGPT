export interface DocumentItem {
  id: number;
  title: string;
  date: string;
  text: string;
  simplified: string;
}

export const historyItems: DocumentItem[] = [
  {
    id: 1,
    title: 'Employment Contract - Software Engineer',
    date: 'Dec 15, 2024',
    text: `EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into on December 1, 2024, between TechCorp Inc., a Delaware corporation ("Company"), and John Smith ("Employee").

1. POSITION AND DUTIES
Employee shall serve as Software Engineer and shall perform such duties as may be assigned by the Company's management. Employee agrees to devote full time and attention to the business of the Company.

2. COMPENSATION
Company shall pay Employee an annual salary of $120,000, payable in accordance with Company's standard payroll practices. Employee shall be eligible for annual performance bonuses at the sole discretion of the Company.

3. BENEFITS
Employee shall be entitled to participate in all employee benefit plans maintained by the Company, subject to the terms and conditions of such plans.

4. TERMINATION
This Agreement may be terminated by either party with thirty (30) days written notice. Upon termination, Employee shall return all Company property and confidential information.

5. CONFIDENTIALITY
Employee acknowledges that during employment, Employee may have access to confidential information. Employee agrees to maintain the confidentiality of such information both during and after employment.

6. NON-COMPETE
For a period of twelve (12) months following termination of employment, Employee agrees not to engage in any business that competes with the Company within a fifty (50) mile radius of Company's headquarters.

7. GOVERNING LAW
This Agreement shall be governed by the laws of the State of Delaware.`,
    simplified: `This is an employment contract between TechCorp Inc. and John Smith for a Software Engineer position.

Key Points:

Job: You will work as a Software Engineer and do tasks assigned by management. This is a full-time position requiring your complete attention.

Pay: You will earn $120,000 per year, paid according to the company's regular schedule. You may get performance bonuses, but the company decides if and when to give them.

Benefits: You can join the company's employee benefit programs following their rules.

Ending the Job: Either you or the company can end this job by giving 30 days written notice. When you leave, you must return all company property and confidential information.

Keeping Secrets: You will learn confidential company information during your job. You must keep this information secret while working and after you leave.

Competition Restrictions: For 12 months after leaving, you cannot work for competing businesses within 50 miles of the company's main office.

Legal Rules: Delaware state law governs this contract.`
  },
  {
    id: 2,
    title: 'Rental Agreement - Downtown Apartment',
    date: 'Dec 14, 2024',
    text: `RESIDENTIAL LEASE AGREEMENT

This Lease Agreement is made between Metro Properties LLC ("Landlord") and Sarah Johnson ("Tenant") for the rental of the property located at 123 Main Street, Apt 4B, Downtown City.

TERM: The lease term is for twelve (12) months, beginning January 1, 2025, and ending December 31, 2025.

RENT: Monthly rent is $2,500, due on the first day of each month. Late fees of $50 will be charged for payments received after the 5th day of the month.

SECURITY DEPOSIT: Tenant shall pay a security deposit of $2,500 prior to occupancy. This deposit will be returned within 30 days of lease termination, less any deductions for damages or unpaid rent.

UTILITIES: Tenant is responsible for electricity, gas, internet, and cable. Landlord pays for water, sewer, and trash collection.

PETS: No pets are allowed without prior written consent from Landlord. If approved, a pet deposit of $500 is required.

MAINTENANCE: Tenant must report maintenance issues promptly. Landlord will address repairs within reasonable time, except for tenant-caused damage.

TERMINATION: Either party may terminate this lease with 60 days written notice. Early termination by tenant requires payment of two months' rent as penalty.`,
    simplified: `This is a rental agreement between Metro Properties LLC (landlord) and Sarah Johnson (tenant) for an apartment at 123 Main Street, Apt 4B.

Key Terms:

Length: 12 months, from January 1, 2025 to December 31, 2025.

Rent: $2,500 per month, due on the 1st. If you pay after the 5th, you owe an extra $50 late fee.

Security Deposit: $2,500 paid before moving in. You get this back within 30 days after moving out, minus any money owed for damages or unpaid rent.

Bills: You pay for electricity, gas, internet, and cable. The landlord pays for water, sewer, and trash.

Pets: No pets unless the landlord gives written permission. If approved, you pay an extra $500 pet deposit.

Repairs: Tell the landlord about problems quickly. They will fix things in a reasonable time, unless you caused the damage.

Ending Early: Either side can end the lease with 60 days written notice. If you leave early, you must pay two months' rent as a penalty.`
  }
];

export const savedItems: DocumentItem[] = [
  {
    id: 3,
    title: 'Software License Agreement - Adobe Creative Suite',
    date: 'Dec 13, 2024',
    text: `SOFTWARE LICENSE AGREEMENT

This Software License Agreement ("Agreement") is between Adobe Inc. ("Adobe") and the end user ("You") for the use of Adobe Creative Suite software.

LICENSE GRANT: Adobe grants you a non-exclusive, non-transferable license to use the software on up to two (2) devices that you own or control.

RESTRICTIONS: You may not: (a) reverse engineer, decompile, or disassemble the software; (b) rent, lease, or sublicense the software; (c) use the software for commercial purposes beyond the scope of your license.

SUBSCRIPTION TERMS: This is a subscription-based license. Your subscription will automatically renew unless cancelled at least 24 hours before the renewal date. Cancellation must be done through your Adobe account.

PAYMENT: Subscription fees are charged monthly or annually as selected. All fees are non-refundable except as required by law.

TERMINATION: Adobe may terminate this license if you breach any terms. Upon termination, you must cease all use and delete all copies of the software.

LIMITATION OF LIABILITY: Adobe's liability is limited to the amount paid for the software in the twelve months preceding the claim.

UPDATES: Adobe may provide updates to the software. Some updates may be required for continued use.`,
    simplified: `This is a software license agreement between Adobe and you for using Adobe Creative Suite.

What You Can Do:
- Use the software on up to 2 devices you own
- This is not exclusive to you - Adobe can license to others too
- You cannot transfer this license to someone else

What You Cannot Do:
- Take apart or reverse engineer the software
- Rent, lease, or sublicense it to others  
- Use it for commercial purposes beyond what your license allows

Subscription Details:
- This is a subscription service that automatically renews
- To cancel, you must do so at least 24 hours before renewal through your Adobe account
- Fees are charged monthly or yearly based on your choice
- No refunds except where required by law

Ending the Agreement:
- Adobe can end your license if you break the rules
- When it ends, you must stop using the software and delete all copies

Liability:
- If something goes wrong, Adobe only owes you up to what you paid in the last 12 months

Updates:
- Adobe may send software updates
- Some updates might be required to keep using the software`
  }
];
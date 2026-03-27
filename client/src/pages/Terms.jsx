import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0A1628] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-[#C9A84C]" />
            <h1 className="text-3xl font-bold">Terms of Service</h1>
          </div>
          <p className="text-gray-300 text-sm">
            Last updated: 1 January 2025 &nbsp;·&nbsp; Effective: 1 January 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-[#C9A84C] hover:underline mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Login
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 space-y-8 text-gray-700 text-sm leading-relaxed">

          {/* Intro */}
          <section>
            <p>
              Welcome to <strong>MaidSaathi</strong> ("Platform", "we", "us", "our"), operated by
              MaidSaathi Technologies Private Limited, a company incorporated under the Companies
              Act, 2013, with its registered office in Mumbai, Maharashtra, India. By accessing or
              using our website, mobile application, or any related services (collectively, the
              "Services"), you ("User", "you", "your") agree to be bound by these Terms of Service
              ("Terms"). If you do not agree, please discontinue use immediately.
            </p>
          </section>

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">1. Eligibility</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must be at least 18 years of age to use this Platform.</li>
              <li>You must be legally capable of entering into binding contracts under the Indian Contract Act, 1872.</li>
              <li>If you are registering on behalf of a business, you represent that you have authority to bind that entity.</li>
              <li>Persons declared incompetent to contract by a court of competent jurisdiction are not eligible to use the Platform.</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">2. User Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>You must provide accurate, current, and complete information at registration and keep it updated.</li>
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>You are liable for all activity that occurs under your account.</li>
              <li>Notify us immediately at <strong>support@MaidSaathi.in</strong> if you suspect unauthorised use of your account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">3. Nature of the Platform — Intermediary</h2>
            <p className="mb-2">
              MaidSaathi is an online intermediary marketplace that connects customers seeking
              household services with independent service providers ("Workers"). We do not employ
              Workers, and Workers are not agents of MaidSaathi. We facilitate introductions and
              provide tools for booking, payments, and reviews.
            </p>
            <p>
              In accordance with the Information Technology (Intermediary Guidelines and Digital
              Media Ethics Code) Rules, 2021, MaidSaathi acts as an intermediary and is not
              responsible for content or services provided by third-party Workers. We exercise
              due diligence including identity verification as described below.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">4. Worker Verification</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Workers are required to submit a valid Aadhaar card (document + number) and a
                profile photograph for identity verification before being listed on the Platform.
              </li>
              <li>
                Verification is conducted by our admin team. Listing on the Platform does not
                constitute an endorsement of the Worker's skills or character.
              </li>
              <li>
                Aadhaar data is handled strictly in accordance with the Aadhaar (Targeted Delivery
                of Financial and Other Subsidies, Benefits and Services) Act, 2016 and applicable
                UIDAI guidelines. We do not use Aadhaar for authentication; it is used only for
                identity verification.
              </li>
              <li>Workers may be rejected or de-listed at our sole discretion.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">5. Bookings and Cancellations</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>A booking is confirmed only upon acceptance by the Worker and completion of payment (where applicable).</li>
              <li>Customers may cancel bookings subject to the cancellation policy in effect at the time of booking, which is displayed before payment.</li>
              <li>Workers who repeatedly cancel accepted bookings may be removed from the Platform.</li>
              <li>MaidSaathi is not liable for losses arising from a Worker's failure to fulfil a booking.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">6. Payments, Wallet, and Refunds</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All payments are processed through Razorpay, a PCI-DSS compliant third-party payment gateway. We do not store card details.</li>
              <li>Prices displayed on the Platform are inclusive of applicable taxes unless otherwise stated.</li>
              <li>Refunds are processed within 5–7 working days to the original payment method or Platform wallet, subject to our Refund Policy.</li>
              <li>Wallet credits have no cash value and cannot be transferred. They expire 12 months from the date of credit.</li>
              <li>In the event of a dispute over a payment, please contact us at <strong>support@MaidSaathi.in</strong>. We shall try to resolve it within 30 days in accordance with the Consumer Protection Act, 2019.</li>
            </ul>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">7. Reviews and Ratings</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Reviews must be honest, based on genuine experience, and must not be defamatory, obscene, or otherwise unlawful.</li>
              <li>We reserve the right to remove reviews that violate these standards.</li>
              <li>Fake or incentivised reviews are strictly prohibited and may result in account termination.</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">8. Prohibited Activities</h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use the Platform for any unlawful purpose or in violation of any applicable law, including the IT Act, 2000.</li>
              <li>Upload, transmit, or distribute any content that is obscene, defamatory, harassing, or infringes on intellectual property rights.</li>
              <li>Attempt to gain unauthorised access to the Platform, other accounts, or our systems.</li>
              <li>Use the Platform to solicit Workers to conduct transactions outside the Platform to avoid fees.</li>
              <li>Misrepresent your identity or impersonate any person or entity.</li>
              <li>Engage in any activity that disrupts, damages, or impairs the Platform.</li>
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">9. Intellectual Property</h2>
            <p>
              All content on the Platform, including but not limited to logos, text, graphics,
              software, and data compilations, is the exclusive property of MaidSaathi Technologies
              Private Limited or its licensors and is protected under the Copyright Act, 1957 and
              the Trade Marks Act, 1999. You may not reproduce, distribute, or create derivative
              works without our prior written consent.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">10. Limitation of Liability</h2>
            <p className="mb-2">
              To the maximum extent permitted by applicable law, MaidSaathi shall not be liable for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Any indirect, incidental, special, consequential, or punitive damages.</li>
              <li>Loss of property, injury, or harm caused by a Worker during service delivery.</li>
              <li>Interruptions or errors in the Platform.</li>
            </ul>
            <p className="mt-2">
              Our aggregate liability for any claim shall not exceed the amount paid by you to
              MaidSaathi in the three months preceding the event giving rise to the claim.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless MaidSaathi, its officers, directors,
              employees, and agents from any claim, demand, loss, or expense (including reasonable
              legal fees) arising out of your use of the Platform, violation of these Terms, or
              infringement of any third-party rights.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">12. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of India. Any dispute arising out of or in
              connection with these Terms shall first be attempted to be resolved through mutual
              negotiation. If unresolved within 30 days, the dispute shall be referred to
              arbitration under the Arbitration and Conciliation Act, 1996 (as amended). The seat
              of arbitration shall be Mumbai, Maharashtra. The language of arbitration shall be
              English. The decision of the arbitrator shall be final and binding.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">13. Grievance Officer</h2>
            <p>
              In accordance with the Information Technology Act, 2000 and the rules made thereunder,
              the name and contact details of the Grievance Officer are:
            </p>
            <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm space-y-1">
              <p><strong>Name:</strong> Ritesh Singh</p>
              <p><strong>Designation:</strong> Grievance Officer</p>
              <p><strong>Email:</strong> grievance@MaidSaathi.in</p>
              <p><strong>Address:</strong> MaidSaathi Technologies Pvt. Ltd., Mumbai, Maharashtra – 400001</p>
              <p><strong>Working hours:</strong> Monday – Friday, 10:00 AM – 6:00 PM IST</p>
            </div>
            <p className="mt-2">
              Grievances shall be acknowledged within 24 hours and resolved within 15 days of
              receipt.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-lg font-semibold text-[#0A1628] mb-3">14. Changes to Terms</h2>
            <p>
              We may update these Terms from time to time. We will notify registered users via
              email or an in-app notification at least 7 days before material changes take effect.
              Continued use of the Platform after the effective date constitutes acceptance of the
              updated Terms.
            </p>
          </section>

          {/* Footer */}
          <div className="border-t pt-6 text-center text-xs text-gray-400">
            <p>MaidSaathi Technologies Private Limited &nbsp;·&nbsp; Mumbai, India</p>
            <p className="mt-1">
              Questions?{' '}
              <a href="mailto:support@MaidSaathi.in" className="text-[#C9A84C] hover:underline">
                support@MaidSaathi.in
              </a>
              {' '}·{' '}
              <Link to="/privacy" className="text-[#C9A84C] hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

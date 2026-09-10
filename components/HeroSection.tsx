// "use client"
// import { Button } from "@/components/ui/button"
// import { useRouter } from "next/navigation"

// export function HeroSection() {
//   const router = useRouter()
//   const handleComplaintStatus = () => {
//     router.push("/complaint_status")
//   }

//   const workflow = [
//     {
//       step: "1. Email Approval",
//       urduTitle: "ای میل منظوری",
//       english:
//         "The administrator reviews the request, and the system sends an email notification informing the user whether the account has been approved or rejected.",
//       urdu:
//         "ایڈمنسٹریٹر درخواست کا جائزہ لیتا ہے، اور سسٹم صارف کو ای میل نوٹیفکیشن بھیجتا ہے جس میں بتایا جاتا ہے کہ اکاؤنٹ منظور ہوا ہے یا مسترد کر دیا گیا ہے۔"
//     },
//     {
//       step: "2. Email Verification",
//       urduTitle: "ای میل تصدیق",
//       english:
//         "If the account is approved, the user enters the registered email address. The system verifies the email, and after successful verification, the user clicks Verify & Continue to access the dashboard.",
//       urdu:
//         "اگر اکاؤنٹ منظور ہو جائے تو صارف اپنی رجسٹرڈ ای میل درج کرتا ہے۔ سسٹم ای میل کی تصدیق کرتا ہے اور کامیاب تصدیق کے بعد صارف Verify & Continue پر کلک کر کے ڈیش بورڈ تک رسائی حاصل کرتا ہے۔"
//     },
//     {
//       step: "3. Dashboard",
//       urduTitle: "ڈیش بورڈ",
//       english:
//         "After logging in, the user can access two main modules: Complete Profile and Complaint Registration.",
//       urdu:
//         "لاگ ان کرنے کے بعد صارف کو دو اہم ماڈیولز تک رسائی حاصل ہوتی ہے: مکمل پروفائل اور شکایت رجسٹریشن۔"
//     },
//     {
//       step: "4. Complete Profile",
//       urduTitle: "مکمل پروفائل",
//       english:
//         "The system automatically retrieves the information provided during registration. The user can review and update profile details if needed, and notifications related to submitted information are displayed.",
//       urdu:
//         "سسٹم رجسٹریشن کے دوران فراہم کردہ معلومات خودکار طور پر حاصل کرتا ہے۔ صارف اپنی معلومات کو دیکھ اور ضرورت کے مطابق اپ ڈیٹ کر سکتا ہے جبکہ جمع شدہ معلومات سے متعلق نوٹیفکیشن بھی دکھائے جاتے ہیں۔"
//     },
//     {
//       step: "5. Complaint Registration",
//       urduTitle: "شکایت رجسٹریشن",
//       english:
//         "The user opens the Complaint Registration module, selects the Company and Software, enters complaint details, and submits the complaint.",
//       urdu:
//         "صارف شکایت رجسٹریشن ماڈیول کھولتا ہے، کمپنی اور سافٹ ویئر منتخب کرتا ہے، شکایت کی تفصیلات درج کرتا ہے اور شکایت جمع کرواتا ہے۔"
//     },
//     {
//       step: "6. Complaint Code",
//       urduTitle: "شکایت کوڈ",
//       english:
//         "After successful submission, the system generates a unique Complaint Code and sends a notification. The complaint code is used to track status and monitor progress.",
//       urdu:
//         "کامیاب جمع کروانے کے بعد سسٹم ایک منفرد شکایت کوڈ تیار کرتا ہے اور صارف کو نوٹیفکیشن بھیجتا ہے۔ یہ کوڈ شکایت کی صورتحال اور پیش رفت کو چیک کرنے کے لیے استعمال ہوتا ہے۔"
//     },
//     {
//       step: "7. Complaint Resolution",
//       urduTitle: "شکایت کا حل",
//       english:
//         "Once the complaint is resolved, the system updates the status to Completed and sends a confirmation notification to the user.",
//       urdu:
//         "جب شکایت حل ہو جاتی ہے تو سسٹم اس کا اسٹیٹس Completed کر دیتا ہے اور صارف کو تصدیقی نوٹیفکیشن بھیجتا ہے۔"
//     },
//     {
//       step: "8. Final Action",
//       urduTitle: "حتمی کارروائی",
//       english:
//         "The user can select Done to confirm successful resolution and close the complaint, or select Reopen if the issue is not resolved.",
//       urdu:
//         "صارف Done منتخب کر کے شکایت بند کر سکتا ہے یا مسئلہ حل نہ ہونے کی صورت میں Reopen کا انتخاب کر سکتا ہے۔"
//     }
//   ]

//   return (
//     <>
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap');`,
//         }}
//       />

//       <section className="relative min-h-screen bg-background pt-16">
//         {/* Complaint Status button – shown once at the top */}
//         <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end">
//           <Button
//             variant="outline"
//             onClick={handleComplaintStatus}
//             className="border-primary/30 hover:bg-accent/40 hover:border-primary transition-all duration-300"
//           >
//             Complaint Status
//           </Button>
//         </div>

//         {/* Registration information box (Hero section) */}
//         <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4">
//           <div className="max-w-8xl mx-auto bg-white border-l-4 border-blue-600 rounded-lg shadow-lg p-3 md:p-5">
//             <div className="flex flex-col md:flex-row justify-between items-start gap-4">
//               {/* English Column */}
//               <div className="w-full md:w-1/2">
//                 <h3 className="text-sm font-semibold text-left text-gray-800 mb-2">
//                   How a User Can Register
//                 </h3>
//                 <p className="text-xs text-left text-gray-700 leading-[2.4]">
//                   User Registration Module allows new users to create an account by entering personal and company details. The system provides search options to select the company and software. After registration, a 6-digit OTP is sent to the users email for verification. Once the email is verified, the registration request is sent to the administrator for approval. The user waits for the approval process, which may take approximately 5 to 7 working days. After approval, the user can access the system using the registered email.
//                 </p>
//               </div>

//               {/* Urdu Column */}
//               <div className="w-full md:w-1/2 text-right" dir="rtl" lang="ur">
//                 <h3
//                   className="text-sm font-semibold text-gray-800 mb-2"
//                   style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
//                 >
//                   صارف کیسے رجسٹر کر سکتا ہے
//                 </h3>
//                 <p
//                   className="text-xs text-gray-700"
//                   style={{
//                     fontFamily: "'Noto Nastaliq Urdu', serif",
//                     lineHeight: "2.4",
//                   }}
//                 >
//                   یوزر رجسٹریشن ماڈیول نئے صارفین کو اپنا اکاؤنٹ بنانے کی سہولت فراہم
//                   کرتا ہے۔ صارف اپنا نام، ذاتی معلومات اور کمپنی کی تفصیلات درج کرتا
//                   ہے۔ کمپنی اور سافٹ ویئر منتخب کرنے کے لیے آسان سرچ آپشن بھی موجود
//                   ہوتا ہے۔ رجسٹریشن مکمل کرنے کے بعد صارف کی ای میل پر 6 ہندسوں کا
//                   OTP بھیجا جاتا ہے، جس کے ذریعے صارف اپنی ای میل کی تصدیق کرتا ہے۔
//                   ای میل کی کامیاب تصدیق کے بعد رجسٹریشن کی درخواست ایڈمن کے پاس
//                   منظوری کے لیے بھیج دی جاتی ہے۔ صارف کو ایڈمن کی جانب سے درخواست
//                   چیک اور منظور ہونے تک انتظار کرنا ہوتا ہے، جس میں تقریباً 5 سے 7
//                   کام کے دن لگ سکتے ہیں۔
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Complaint Workflow Card */}
//         <div className="container mx-auto px-6 pb-12">
//           <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-600 p-5">
//             <h1 className="text-center text-2xl font-bold text-blue-900 ">
//              How a User File Complaint
//             </h1>

//             {workflow.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex flex-col md:flex-row gap-5 border-b py-3"
//               >
//                 {/* English */}
//                 <div className="w-full md:w-1/2 pr-4 border-r-0 md:border-r-2 border-blue-900">
//                   <span className="inline-block bg-blue-100 text-blue-700 px-3 py-2 rounded-md font-semibold text-xs">
//                     {item.step}
//                   </span>
//                   <p className="mt-3 text-gray-700 leading-loose text-xs">
//                     {item.english}
//                   </p>
//                 </div>

//                 {/* Urdu */}
//                 <div className="w-full md:w-1/2 text-right" dir="rtl">
//                   <h2
//                     className="text-lg font-bold text-blue-900"
//                     style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
//                   >
//                     {item.urduTitle}
//                   </h2>
//                   <p
//                     className="text-gray-700 text-xs leading-loose mt-1"
//                     style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
//                   >
//                     {item.urdu}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>
//     </>
//   )
// }

"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const router = useRouter()

  const handleComplaintStatus = () => {
    router.push("/complaint_status")
  }

  const workflow = [
    {
      step: "1. Email Approval",
      urduTitle: "ای میل منظوری",
      english:
        "The administrator reviews the request, and the system sends an email notification informing the user whether the account has been approved or rejected.",
      urdu:
        "ایڈمنسٹریٹر درخواست کا جائزہ لیتا ہے، اور سسٹم صارف کو ای میل نوٹیفکیشن بھیجتا ہے جس میں بتایا جاتا ہے کہ اکاؤنٹ منظور ہوا ہے یا مسترد کر دیا گیا ہے۔",
    },
    {
      step: "2. Email Verification",
      urduTitle: "ای میل تصدیق",
      english:
        "If the account is approved, the user enters the registered email address. The system verifies the email, and after successful verification, the user clicks Verify & Continue to access the dashboard.",
      urdu:
        "اگر اکاؤنٹ منظور ہو جائے تو صارف اپنی رجسٹرڈ ای میل درج کرتا ہے۔ سسٹم ای میل کی تصدیق کرتا ہے اور کامیاب تصدیق کے بعد صارف Verify & Continue پر کلک کر کے ڈیش بورڈ تک رسائی حاصل کرتا ہے۔",
    },
    {
      step: "3. Dashboard",
      urduTitle: "ڈیش بورڈ",
      english:
        "After logging in, the user can access two main modules: Complete Profile and Complaint Registration.",
      urdu:
        "لاگ ان کرنے کے بعد صارف کو دو اہم ماڈیولز تک رسائی حاصل ہوتی ہے: مکمل پروفائل اور شکایت رجسٹریشن۔",
    },
    {
      step: "4. Complete Profile",
      urduTitle: "مکمل پروفائل",
      english:
        "The system automatically retrieves the information provided during registration. The user can review and update profile details if needed, and notifications related to submitted information are displayed.",
      urdu:
        "سسٹم رجسٹریشن کے دوران فراہم کردہ معلومات خودکار طور پر حاصل کرتا ہے۔ صارف اپنی معلومات کو دیکھ اور ضرورت کے مطابق اپ ڈیٹ کر سکتا ہے جبکہ جمع شدہ معلومات سے متعلق نوٹیفکیشن بھی دکھائے جاتے ہیں۔",
    },
    {
      step: "5. Complaint Registration",
      urduTitle: "شکایت رجسٹریشن",
      english:
        "The user opens the Complaint Registration module, selects the Company and Software, enters complaint details, and submits the complaint.",
      urdu:
        "صارف شکایت رجسٹریشن ماڈیول کھولتا ہے، کمپنی اور سافٹ ویئر منتخب کرتا ہے، شکایت کی تفصیلات درج کرتا ہے اور شکایت جمع کرواتا ہے۔",
    },
    {
      step: "6. Complaint Code",
      urduTitle: "شکایت کوڈ",
      english:
        "After successful submission, the system generates a unique Complaint Code and sends a notification. The complaint code is used to track status and monitor progress.",
      urdu:
        "کامیاب جمع کروانے کے بعد سسٹم ایک منفرد شکایت کوڈ تیار کرتا ہے اور صارف کو نوٹیفکیشن بھیجتا ہے۔ یہ کوڈ شکایت کی صورتحال اور پیش رفت کو چیک کرنے کے لیے استعمال ہوتا ہے۔",
    },
    {
      step: "7. Complaint Resolution",
      urduTitle: "شکایت کا حل",
      english:
        "Once the complaint is resolved, the system updates the status to Completed and sends a confirmation notification to the user.",
      urdu:
        "جب شکایت حل ہو جاتی ہے تو سسٹم اس کا اسٹیٹس Completed کر دیتا ہے اور صارف کو تصدیقی نوٹیفکیشن بھیجتا ہے۔",
    },
    {
      step: "8. Final Action",
      urduTitle: "حتمی کارروائی",
      english:
        "The user can select Done to confirm successful resolution and close the complaint, or select Reopen if the issue is not resolved.",
      urdu:
        "صارف Done منتخب کر کے شکایت بند کر سکتا ہے یا مسئلہ حل نہ ہونے کی صورت میں Reopen کا انتخاب کر سکتا ہے۔",
    },
  ]

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;600;700&display=swap');`,
        }}
      />

      <section className="relative min-h-screen bg-background pt-16">

        {/* Complaint Status Button */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={handleComplaintStatus}
            className="border-primary/30 hover:bg-accent/40 hover:border-primary transition-all duration-300 text-sm"
          >
            Complaint Status
          </Button>
        </div>

        {/* Registration Information */}
        <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-4">
          <div className="max-w-8xl mx-auto bg-white border-l-4 border-blue-600 rounded-lg shadow-lg p-3 md:p-5">

            <div className="flex flex-col md:flex-row justify-between items-start gap-4">

              {/* English */}
              <div className="w-full md:w-1/2">
                <h3 className="text-base font-semibold text-left text-gray-800 mb-2">
                  How a User Can Register
                </h3>

                <p className="text-sm text-left text-gray-700 leading-[2.2]">
                  User Registration Module allows new users to create an account
                  by entering personal and company details. The system provides
                  search options to select the company and software. After
                  registration, a 6-digit OTP is sent to the users email for
                  verification. Once the email is verified, the registration
                  request is sent to the administrator for approval. The user
                  waits for the approval process, which may take approximately
                  5 to 7 working days. After approval, the user can access the
                  system using the registered email.
                </p>
              </div>

              {/* Urdu */}
              <div
                className="w-full md:w-1/2 text-right"
                dir="rtl"
                lang="ur"
              >
                <h3
                  className="text-base font-semibold text-gray-800 mb-2"
                  style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                >
                  صارف کیسے رجسٹر کر سکتا ہے
                </h3>

                <p
                  className="text-sm text-gray-700"
                  style={{
                    fontFamily: "'Noto Nastaliq Urdu', serif",
                    lineHeight: "2.4",
                  }}
                >
                  یوزر رجسٹریشن ماڈیول نئے صارفین کو اپنا اکاؤنٹ بنانے کی سہولت
                  فراہم کرتا ہے۔ صارف اپنا نام، ذاتی معلومات اور کمپنی کی تفصیلات
                  درج کرتا ہے۔ کمپنی اور سافٹ ویئر منتخب کرنے کے لیے آسان سرچ
                  آپشن بھی موجود ہوتا ہے۔ رجسٹریشن مکمل کرنے کے بعد صارف کی ای
                  میل پر 6 ہندسوں کا OTP بھیجا جاتا ہے، جس کے ذریعے صارف اپنی
                  ای میل کی تصدیق کرتا ہے۔ ای میل کی کامیاب تصدیق کے بعد
                  رجسٹریشن کی درخواست ایڈمن کے پاس منظوری کے لیے بھیج دی جاتی
                  ہے۔ صارف کو ایڈمن کی جانب سے درخواست چیک اور منظور ہونے تک
                  انتظار کرنا ہوتا ہے، جس میں تقریباً 5 سے 7 کام کے دن لگ سکتے ہیں۔
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Complaint Workflow */}
        <div className="container mx-auto px-6 pb-12">
          <div className="bg-white rounded-xl shadow-lg border-l-4 border-blue-600 p-5">

            <h1 className="text-center text-2xl md:text-3xl font-bold text-blue-900 mb-4">
              How a User File Complaint
            </h1>

            {workflow.map((item, index) => (
              <div
                key={index}
                className="flex flex-col md:flex-row gap-5 border-b py-4"
              >

                {/* English */}
                <div className="w-full md:w-1/2 pr-4 border-r-0 md:border-r-2 border-blue-900">

                  <span className="inline-block bg-blue-100 text-blue-700 px-3 py-2 rounded-md font-semibold text-sm">
                    {item.step}
                  </span>

                  <p className="mt-3 text-sm md:text-base text-gray-700 leading-[1.9]">
                    {item.english}
                  </p>
                </div>

                {/* Urdu */}
                <div
                  className="w-full md:w-1/2 text-right"
                  dir="rtl"
                >
                  <h2
                    className="text-xl font-bold text-blue-900"
                    style={{
                      fontFamily: "'Noto Nastaliq Urdu', serif",
                    }}
                  >
                    {item.urduTitle}
                  </h2>

                  <p
                    className="text-sm md:text-base text-gray-700 leading-[2.2] mt-1"
                    style={{
                      fontFamily: "'Noto Nastaliq Urdu', serif",
                    }}
                  >
                    {item.urdu}
                  </p>
                </div>

              </div>
            ))}

          </div>
        </div>

      </section>
    </>
  )
}
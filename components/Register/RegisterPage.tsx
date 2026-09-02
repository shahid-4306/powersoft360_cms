
"use client";

import {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Image from "next/image";
import { CompanySearch } from "@/components/online_complaint/CompanySearch";
import type { Company } from "@/components/online_complaint/CompanySearch";

// ==================== Types ====================
interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "tel" | "select" | "file" | "textarea";
  placeholder?: string;
  required?: boolean;
  options?: readonly string[] | string[];
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
    message: string;
  };
  icon?: React.ReactNode;
  accept?: string;
  maxSize?: number;
}

interface RegisterFormData {
  [key: string]: string | File | null;
  fullName: string;
  phoneNumber: string;
  email: string;
  companyName: string;
  softwareType: string;
  profileImage: File | null;
  description: string;
}

interface FormErrors {
  [key: string]: string;
}

interface FormConfig {
  title: string;
  subtitle: string;
  buttonText: string;
  successMessage: string;
  errorMessage: string;
}

// ==================== SVG Icons as Components ====================
const Icons = {
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  email: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  building: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  code: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  camera: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

// ==================== Configuration ====================
const FORM_CONFIG: FormConfig = {
  title: "Create Your Account",
  subtitle: "Register to submit complaints and manage your software solutions",
  buttonText: "Create Account",
  successMessage:
    "Registration submitted! Your account is pending admin approval — you will get an email once it is reviewed.",
  errorMessage: "Registration failed. Please try again.",
};

// ==================== Form Fields Configuration ====================
const FORM_FIELDS: FormField[] = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "John Doe",
    required: true,
    validation: {
      minLength: 2,
      maxLength: 50,
      message: "Name must be between 2 and 50 characters",
    },
    icon: Icons.user,
  },
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    placeholder: "e.g 0300-0000000",
    required: true,
    validation: {
      pattern: /^\+?[\d\s\-()]{10,}$/,
      message: "Please enter a valid phone number",
    },
    icon: Icons.phone,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "john@company.com",
    required: true,
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address",
    },
    icon: Icons.email,
  },
  // companyName is handled by CompanySearch component
  // softwareType is handled by a dedicated multi‑select component
  {
    name: "softwareType",
    label: "Software Type",
    type: "select",
    placeholder: "Search and select software types...",
    required: true,
    validation: {
      message: "Please select at least one software type",
    },
    icon: Icons.code,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Brief description of your requirements...",
    required: false,
    validation: {
      maxLength: 500,
      message: "Description must not exceed 500 characters",
    },
    icon: Icons.document,
  },
  {
    name: "profileImage",
    label: "Profile Image",
    type: "file",
    placeholder: "Upload profile image",
    required: false,
    accept: "image/*",
    maxSize: 5 * 1024 * 1024,
    validation: {
      message: "Please upload a valid image (JPEG, PNG) under 5MB",
    },
    icon: Icons.camera,
  },
];

// ==================== Initial Form State ====================
const INITIAL_FORM_DATA: RegisterFormData = {
  fullName: "",
  phoneNumber: "",
  email: "",
  companyName: "",
  softwareType: "",
  profileImage: null,
  description: "",
};

// ==================== SoftwareType Multi‑Select Component ====================
interface SoftwareTypeSearchProps {
  options: string[];
  onTypeSelect: (type: string) => void;
  disabled?: boolean;
}

const SoftwareTypeSearch: React.FC<SoftwareTypeSearchProps> = ({
  options,
  onTypeSelect,
  disabled = false,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const lowerQuery = query.toLowerCase();
    return options.filter((opt) => opt.toLowerCase().includes(lowerQuery));
  }, [options, query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const selectOption = (option: string) => {
    onTypeSelect(option);
    setQuery("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          selectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search software types..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}   // ensures dropdown opens on every click
          onKeyDown={handleKeyDown}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-primary transition-all duration-200 bg-white hover:border-border text-foreground placeholder-gray-400 disabled:bg-muted/50 disabled:text-muted-foreground disabled:cursor-not-allowed"
        />
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
          {filteredOptions.map((option, index) => (
            <li
              key={option}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                index === highlightedIndex
                  ? "bg-accent/15 text-primary"
                  : "text-foreground/80 hover:bg-muted"
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// ==================== Main Component ====================
export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);
  const [submitErrorMessage, setSubmitErrorMessage] = useState<string>("");
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // ---- Email OTP verification step (added) ----
  // "form" = registration fields, "otp" = enter 6-digit code,
  // "done" = verified, pending admin approval.
  const [registerStep, setRegisterStep] = useState<"form" | "otp" | "done">("form");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpFullName, setOtpFullName] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSecondsLeft, setOtpSecondsLeft] = useState(0);
  const [resendSubmitting, setResendSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  // Countdown for OTP validity (5 minutes)
  useEffect(() => {
    if (registerStep !== "otp" || otpSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setOtpSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [registerStep, otpSecondsLeft]);

  // Cooldown for "Resend OTP" button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatMMSS = useCallback((totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }, []);

  const handleVerifyOtp = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (otpValue.length !== 6) {
        setOtpError("Enter the 6-digit code exactly as received");
        return;
      }

      setOtpSubmitting(true);
      setOtpError("");

      try {
        const response = await fetch("/api/register/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: otpEmail, otp: otpValue }),
        });
        const data = await response.json();

        if (!response.ok) {
          setOtpError(data.message || "Verification failed. Please try again.");
          return;
        }

        setRegisterStep("done");
        setFormData(INITIAL_FORM_DATA);
        setSelectedCompanies([]);
        setSelectedSoftwareTypes([]);
        setImagePreview("");
        setTouchedFields(new Set());
        setErrors({});
        setOtpValue("");
      } catch {
        setOtpError("Failed to verify your code. Please check your connection and try again.");
      } finally {
        setOtpSubmitting(false);
      }
    },
    [otpEmail, otpValue],
  );

  const handleResendOtp = useCallback(async () => {
    if (resendCooldown > 0 || resendSubmitting) return;
    setResendSubmitting(true);
    setResendMessage("");
    setOtpError("");

    try {
      const response = await fetch("/api/register/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await response.json();

      if (!response.ok) {
        setOtpError(data.message || "Failed to resend the code. Please try again.");
        if (typeof data.retryAfterMs === "number") {
          setResendCooldown(Math.ceil(data.retryAfterMs / 1000));
        }
        return;
      }

      setOtpSecondsLeft(data.otpExpiresInSeconds || 5 * 60);
      setResendCooldown(60);
      setResendMessage("A new verification code has been sent to your email.");
      setOtpValue("");
    } catch {
      setOtpError("Failed to resend the code. Please check your connection and try again.");
    } finally {
      setResendSubmitting(false);
    }
  }, [otpEmail, resendCooldown, resendSubmitting]);

  const [selectedCompanies, setSelectedCompanies] = useState<Company[]>([]);
  const companyNameString = useMemo(
    () => selectedCompanies.map((c) => c.companyName).join(", "),
    [selectedCompanies],
  );

  const [selectedSoftwareTypes, setSelectedSoftwareTypes] = useState<string[]>([]);
  const softwareTypeString = useMemo(
    () => selectedSoftwareTypes.join(", "),
    [selectedSoftwareTypes],
  );

  const [softwareTypeOptions, setSoftwareTypeOptions] = useState<string[]>([]);
  const [softwareTypesLoading, setSoftwareTypesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/software-types")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const names = Array.isArray(data.softwareTypes)
          ? data.softwareTypes.map((t: { name: string }) => t.name)
          : [];
        setSoftwareTypeOptions(names);
      })
      .catch(() => {
        if (isMounted) setSoftwareTypeOptions([]);
      })
      .finally(() => {
        if (isMounted) setSoftwareTypesLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, companyName: companyNameString }));
  }, [companyNameString]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, softwareType: softwareTypeString }));
  }, [softwareTypeString]);

  const handleAddCompany = useCallback((company: Company) => {
    if (!company?.companyName) return;
    setSelectedCompanies((prev) => {
      if (prev.some((c) => c.companyName === company.companyName)) return prev;
      return [...prev, company];
    });
    setErrors((prev) => {
      const { companyName: _, ...rest } = prev;
      return rest;
    });
    setTouchedFields((prev) => new Set(prev).add("companyName"));
  }, []);

  const handleRemoveCompany = useCallback((companyName: string) => {
    setSelectedCompanies((prev) =>
      prev.filter((c) => c.companyName !== companyName),
    );
  }, []);

  const handleAddSoftwareType = useCallback((type: string) => {
    if (!type) return;
    setSelectedSoftwareTypes((prev) => {
      if (prev.includes(type)) return prev;
      return [...prev, type];
    });
    setErrors((prev) => {
      const { softwareType: _, ...rest } = prev;
      return rest;
    });
    setTouchedFields((prev) => new Set(prev).add("softwareType"));
  }, []);

  const handleRemoveSoftwareType = useCallback((type: string) => {
    setSelectedSoftwareTypes((prev) => prev.filter((t) => t !== type));
  }, []);

  const validateField = useCallback(
    (name: string, value: string | File | null): string => {
      const field = FORM_FIELDS.find((f) => f.name === name);
      if (!field) return "";

      if (field.required) {
        if (field.type === "file") {
          if (!value) return `${field.label} is required`;
        } else if (!value || (typeof value === "string" && !value.trim())) {
          return `${field.label} is required`;
        }
      }

      if (typeof value === "string" && value.trim()) {
        if (field.validation?.pattern && !field.validation.pattern.test(value)) {
          return field.validation.message;
        }
        if (field.validation?.minLength && value.length < field.validation.minLength) {
          return field.validation.message;
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
          return field.validation.message;
        }
      }

      if (field.type === "file" && value instanceof File) {
        if (field.accept) {
          const validTypes = field.accept.split(",").map((type) => type.trim());
          const isValidType = validTypes.some((type) => {
            if (type.includes("*")) {
              return value.type.startsWith(type.replace("*", ""));
            }
            return value.type === type;
          });

          if (!isValidType) {
            return field.validation?.message || "Invalid file type";
          }
        }

        if (field.maxSize && value.size > field.maxSize) {
          return `File size must be less than ${field.maxSize / (1024 * 1024)}MB`;
        }
      }

      return "";
    },
    [],
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    FORM_FIELDS.forEach((field) => {
      if (field.name === "softwareType") return;
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    if (selectedCompanies.length === 0) {
      newErrors["companyName"] = "Please select at least one company";
      isValid = false;
    }

    if (selectedSoftwareTypes.length === 0) {
      newErrors["softwareType"] = "Please select at least one software type";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [formData, validateField, selectedCompanies, selectedSoftwareTypes]);

  const handleInputChange = useCallback(
    (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (touchedFields.has(name)) {
        const error = validateField(name, value);
        setErrors((prev) => ({
          ...prev,
          [name]: error,
        }));
      }
    },
    [touchedFields, validateField],
  );

  const handleBlur = useCallback(
    (name: string) => {
      setTouchedFields((prev) => new Set(prev).add(name));
      const error = validateField(name, formData[name]);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    },
    [formData, validateField],
  );

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
        }));

        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        const error = validateField("profileImage", file);
        setErrors((prev) => ({
          ...prev,
          profileImage: error,
        }));
        setTouchedFields((prev) => new Set(prev).add("profileImage"));
      }
    },
    [validateField],
  );

  const removeImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      profileImage: null,
    }));
    setImagePreview("");
    setErrors((prev) => ({
      ...prev,
      profileImage: "",
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const allFields = new Set(FORM_FIELDS.map((f) => f.name));
      setTouchedFields(
        (prev) => new Set([...prev, ...allFields, "companyName"]),
      );

      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      setSubmitStatus(null);

      try {
        const submitData = new FormData();
        submitData.append("fullName", formData.fullName);
        submitData.append("phoneNumber", formData.phoneNumber);
        submitData.append("email", formData.email);
        submitData.append("companyName", companyNameString);
        submitData.append("softwareType", softwareTypeString);
        submitData.append("description", formData.description);

        if (formData.profileImage instanceof File) {
          submitData.append("profileImage", formData.profileImage);
        }

        const response = await fetch("/api/register", {
          method: "POST",
          body: submitData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.errors) {
            setErrors((prev) => ({ ...prev, ...errorData.errors }));
          }
          throw new Error(errorData.message || "Registration failed");
        }

        const result = await response.json();
        console.log("✅ Registration successful:", result);

        if (result.requiresOtp) {
          // Move to the email OTP verification step instead of resetting
          // the form — the account stays pending until the code is entered.
          setOtpEmail(result.email || formData.email);
          setOtpFullName(formData.fullName);
          setOtpSecondsLeft(result.otpExpiresInSeconds || 5 * 60);
          setResendCooldown(60);
          setOtpError("");
          setResendMessage("");
          setOtpValue("");
          setRegisterStep("otp");
          setSubmitStatus(null);
          return;
        }

        setSubmitStatus("success");
        setSubmitErrorMessage("");

        setTimeout(() => {
          setFormData(INITIAL_FORM_DATA);
          setSelectedCompanies([]);
          setSelectedSoftwareTypes([]);
          setImagePreview("");
          setTouchedFields(new Set());
          setErrors({});
          setSubmitStatus(null);
        }, 5000);
      } catch (error: any) {
        console.error("❌ Submission error:", error);
        setSubmitStatus("error");
        setSubmitErrorMessage(error?.message || "");
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, companyNameString, softwareTypeString],
  );

  const renderInput = (field: FormField) => {
    const hasError = touchedFields.has(field.name) && errors[field.name];

    const baseInputClasses = `
      w-full pl-10 pr-4 py-2 text-sm
      border rounded-lg 
      focus:ring-2 focus:ring-blue-500/20 focus:border-primary 
      transition-all duration-200 bg-white
      ${
        hasError
          ? "border-red-300 bg-red-50/50 text-red-900 placeholder-red-300"
          : "border-border hover:border-border text-foreground placeholder-gray-400"
      }
      ${field.type === "textarea" ? "min-h-[100px] resize-y" : ""}
      disabled:bg-muted/50 disabled:text-muted-foreground disabled:cursor-not-allowed
    `;

    switch (field.type) {
      case "select":
        return null; // softwareType handled separately
      case "textarea":
        return (
          <textarea
            id={field.name}
            name={field.name}
            value={formData[field.name] as string}
            onChange={handleInputChange}
            onBlur={() => handleBlur(field.name)}
            className={baseInputClasses}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            maxLength={field.validation?.maxLength}
          />
        );
      case "file":
        return (
          <div>
            <div
              className={`
              mt-1 flex justify-center px-6 pt-5 pb-5 
              border-2 border-dashed rounded-lg 
              transition-all duration-200
              ${
                hasError
                  ? "border-red-300 bg-red-50/50"
                  : "border-border hover:border-primary/60 bg-muted/50/50"
              }
            `}
            >
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      width={120}
                      height={120}
                      className="mx-auto rounded-lg object-cover w-24 h-24"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-sm"
                      disabled={isSubmitting}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <svg className="mx-auto h-10 w-10 text-muted-foreground/70" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <div className="flex justify-center text-xs text-muted-foreground">
                  <label
                    htmlFor={field.name}
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id={field.name}
                      name={field.name}
                      type="file"
                      accept={field.accept}
                      onChange={handleFileChange}
                      onBlur={() => handleBlur(field.name)}
                      className="sr-only"
                      disabled={isSubmitting}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to {field.maxSize ? field.maxSize / (1024 * 1024) : 5}MB
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            id={field.name}
            name={field.name}
            value={formData[field.name] as string}
            onChange={handleInputChange}
            onBlur={() => handleBlur(field.name)}
            className={baseInputClasses}
            placeholder={field.placeholder}
            disabled={isSubmitting}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/40 via-blue-50 to-accent/15 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
            <h1 className="text-2xl font-bold text-white text-center tracking-tight">
              {FORM_CONFIG.title}
            </h1>
            <p className="mt-2 text-sm text-primary-foreground/80 text-center font-normal">
              {FORM_CONFIG.subtitle}
            </p>
          </div>

          {/* ---------- Step: Email OTP Verification ---------- */}
          {registerStep === "otp" && (
            <div className="p-6 space-y-4">
              <div className="text-center space-y-1.5">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/30">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-foreground">Verify your email</h2>
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code we sent to <span className="font-medium text-foreground">{otpEmail}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="otp" className="block text-sm font-medium text-foreground/80 text-center">
                    Verification Code
                  </label>
                  <input
                    id="otp"
                    name="otp"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtpValue(digitsOnly);
                      if (otpError) setOtpError("");
                    }}
                    disabled={otpSubmitting}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.6em] text-2xl font-semibold py-2.5 px-4 border border-border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-primary transition-all duration-200 bg-white disabled:bg-muted/50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {otpSecondsLeft > 0 ? (
                    <span>Code expires in {formatMMSS(otpSecondsLeft)}</span>
                  ) : (
                    <span className="text-red-600 font-medium">Code expired — request a new one</span>
                  )}
                </div>

                {otpError && (
                  <div className="p-3 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{otpError}</span>
                  </div>
                )}

                {resendMessage && !otpError && (
                  <div className="p-3 rounded-lg text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{resendMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otpSubmitting || otpValue.length !== 6 || otpSecondsLeft === 0}
                  className={`w-full py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white transition-all duration-200 ${
                    otpSubmitting || otpValue.length !== 6 || otpSecondsLeft === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-secondary shadow-sm hover:shadow-md active:scale-[0.99]"
                  }`}
                >
                  {otpSubmitting ? "Verifying..." : "Verify & Complete Registration"}
                </button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendSubmitting || resendCooldown > 0}
                    className="font-medium text-primary hover:text-primary transition-colors disabled:text-muted-foreground disabled:cursor-not-allowed"
                  >
                    {resendSubmitting
                      ? "Sending..."
                      : resendCooldown > 0
                        ? `Resend OTP (${resendCooldown}s)`
                        : "Resend OTP"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterStep("form");
                      setOtpError("");
                      setResendMessage("");
                    }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to registration form
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ---------- Step: Verified / Done ---------- */}
          {registerStep === "done" && (
            <div className="p-6 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-foreground">Email verified!</h2>
              <p className="text-sm text-muted-foreground">
                Your registration is now pending admin approval. You'll receive an email once it's reviewed.
              </p>
              <button
                type="button"
                onClick={() => setRegisterStep("form")}
                className="mt-2 text-sm font-medium text-primary hover:text-primary transition-colors"
              >
                Register another account
              </button>
            </div>
          )}

          {/* Status Messages */}
          {registerStep === "form" && submitStatus && (
            <div
              className={`mx-6 mt-5 p-3 rounded-lg text-sm ${
                submitStatus === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {submitStatus === "success" ? (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="font-medium">
                  {submitStatus === "success"
                    ? FORM_CONFIG.successMessage
                    : submitErrorMessage || FORM_CONFIG.errorMessage}
                </span>
              </div>
            </div>
          )}

          {/* Form */}
          {registerStep === "form" && (
          <form onSubmit={handleSubmit} className="p-6 space-y-3">
            {/* ---------- Company Search (Multiple) ---------- */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground/80">
                <span className="flex items-center gap-1.5">
                  {/* Company <span className="text-red-500">*</span> */}
                </span>
              </label>

              <CompanySearch
                onCompanySelect={handleAddCompany}
                selectedCompany={null}
              />

              {selectedCompanies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCompanies.map((company) => (
                    <span
                      key={company.companyName}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-accent/15 text-primary rounded-full text-sm border border-primary/25"
                    >
                      {company.companyName}
                      <button
                        type="button"
                        onClick={() => handleRemoveCompany(company.companyName)}
                        disabled={isSubmitting}
                        className="text-primary/70 hover:text-red-500 focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {touchedFields.has("companyName") && errors["companyName"] && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors["companyName"]}
                </p>
              )}
            </div>

            {/* ---------- Software Type Multi‑Select ---------- */}
            <div className="space-y-1.5">
              <label
                htmlFor="softwareType"
                className="block text-sm font-medium text-foreground/80"
              >
                <span className="flex items-center gap-1.5">
                  Software Type <span className="text-red-500">*</span>
                </span>
              </label>

              <SoftwareTypeSearch
                options={softwareTypeOptions}
                onTypeSelect={handleAddSoftwareType}
                disabled={isSubmitting || softwareTypesLoading}
              />

              {selectedSoftwareTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedSoftwareTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-accent/15 text-primary rounded-full text-sm border border-primary/25"
                    >
                      {type}
                      <button
                        type="button"
                        onClick={() => handleRemoveSoftwareType(type)}
                        disabled={isSubmitting}
                        className="text-primary/70 hover:text-red-500 focus:outline-none"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {touchedFields.has("softwareType") && errors["softwareType"] && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors["softwareType"]}
                </p>
              )}
            </div>

            {/* Render remaining fields (skip softwareType) */}
            {FORM_FIELDS.filter((field) => field.name !== "softwareType").map(
              (field) => (
                <div key={field.name} className="space-y-1.5">
                  <label
                    htmlFor={field.name}
                    className="block text-sm font-medium text-foreground/80"
                  >
                    <span className="flex items-center gap-1.5">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </span>
                  </label>

                  <div className="relative">
                    {field.type !== "file" &&
                      field.type !== "textarea" &&
                      field.type !== "select" && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground/70">
                          {field.icon}
                        </div>
                      )}
                    {renderInput(field)}
                  </div>

                  {field.type === "textarea" && field.validation?.maxLength && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground/70">
                        {(formData[field.name] as string)?.length || 0}/
                        {field.validation.maxLength}
                      </span>
                    </div>
                  )}

                  {touchedFields.has(field.name) && errors[field.name] && (
                    <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors[field.name]}
                    </p>
                  )}
                </div>
              ),
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  w-full py-2.5 px-4 border border-transparent rounded-lg
                  text-sm font-semibold text-white
                  transition-all duration-200
                  ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-secondary shadow-sm hover:shadow-md active:scale-[0.99]"
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  FORM_CONFIG.buttonText
                )}
              </button>
            </div>
          </form>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a
            href="/customer-login"
            className="font-medium text-primary hover:text-primary transition-colors"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
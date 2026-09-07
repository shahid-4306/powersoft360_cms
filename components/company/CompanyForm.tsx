
// "use client";

// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Building,
//   MapPin,
//   Phone,
//   User,
//   Package,
//   Trash2,
//   Loader2,
// } from "lucide-react";

// interface SoftwareInfo {
//   softwareType: string;
//   version: string;
//   lastUpdated: string;
// }

// interface Company {
//   _id?: string;
//   code: string;
//   companyName: string;
//   city: string;
//   phoneNumber: string;
//   address: string;
//   support: string;
//   designatedDeveloper: string;
//   companyRepresentative: string;
//   softwareInformation: SoftwareInfo[];
// }

// interface CompanyFormProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (companyData: Omit<Company, "_id">) => Promise<void>;
//   isLoading: boolean;
//   users: any[];
//   initialData?: Company;
//   mode: "create" | "edit";
// }

// export function CompanyForm({
//   isOpen,
//   onOpenChange,
//   onSubmit,
//   isLoading,
//   users,
//   initialData,
//   mode,
// }: CompanyFormProps) {
//   const [formData, setFormData] = useState<Omit<Company, "_id">>({
//     code: `CMP-${Date.now()}`,
//     companyName: "",
//     city: "",
//     phoneNumber: "",
//     address: "",
//     support: "Active",
//     designatedDeveloper: "N/A",
//     companyRepresentative: "N/A",
//     softwareInformation: [],
//   });

//   const [softwareDialogOpen, setSoftwareDialogOpen] = useState(false);
//   const [softwareInfo, setSoftwareInfo] = useState({
//     softwareType: "Finance Manager",
//     version: "v1.00",
//     lastUpdated: new Date().toISOString().slice(0, 10),
//   });

//   // Software types are managed by the Administrator (Dashboard → Software
//   // Types) and stored in the database. Only Active types are ever returned.
//   const [softwareTypeOptions, setSoftwareTypeOptions] = useState<string[]>([]);
//   const [softwareTypesLoading, setSoftwareTypesLoading] = useState(true);

//   useEffect(() => {
//     let isMounted = true;

//     fetch("/api/software-types")
//       .then((res) => res.json())
//       .then((data) => {
//         if (!isMounted) return;
//         const names: string[] = Array.isArray(data.softwareTypes)
//           ? data.softwareTypes.map((t: { name: string }) => t.name)
//           : [];
//         setSoftwareTypeOptions(names);
//         // Keep the default selection valid once real options arrive.
//         if (names.length > 0) {
//           setSoftwareInfo((prev) =>
//             names.includes(prev.softwareType)
//               ? prev
//               : { ...prev, softwareType: names[0] },
//           );
//         }
//       })
//       .catch(() => {
//         if (isMounted) setSoftwareTypeOptions([]);
//       })
//       .finally(() => {
//         if (isMounted) setSoftwareTypesLoading(false);
//       });

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   // Reset form when initialData changes or dialog opens/closes
//   useEffect(() => {
//     if (isOpen) {
//       if (mode === "edit" && initialData) {
//         setFormData(initialData);
//       } else {
//         setFormData({
//           code: `CMP-${Date.now()}`,
//           companyName: "",
//           city: "",
//           phoneNumber: "",
//           address: "",
//           support: "Active",
//           designatedDeveloper: "N/A",
//           companyRepresentative: "N/A",
//           softwareInformation: [],
//         });
//       }
//     }
//   }, [isOpen, initialData, mode]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate required fields
//     if (
//       !formData.companyName ||
//       !formData.city ||
//       !formData.phoneNumber ||
//       !formData.address
//     ) {
//       alert("Please fill in all required fields");
//       return;
//     }

//     await onSubmit(formData);

//     // Only reset form after successful creation
//     if (mode === "create") {
//       setFormData({
//         code: `CMP-${Date.now()}`,
//         companyName: "",
//         city: "",
//         phoneNumber: "",
//         address: "",
//         support: "Active",
//         designatedDeveloper: "N/A",
//         companyRepresentative: "N/A",
//         softwareInformation: [],
//       });
//     }
//   };

//   const handleOpenChange = (open: boolean) => {
//     onOpenChange(open);
//   };

//   const handleSoftwareSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     e.stopPropagation();

//     const updatedSoftware = [
//       ...formData.softwareInformation,
//       {
//         ...softwareInfo,
//         lastUpdated: new Date(softwareInfo.lastUpdated).toISOString(),
//       },
//     ];

//     setFormData((prev) => ({ ...prev, softwareInformation: updatedSoftware }));
//     setSoftwareInfo({
//       softwareType: "Finance Manager",
//       version: "v1.00",
//       lastUpdated: new Date().toISOString().slice(0, 10),
//     });
//     setSoftwareDialogOpen(false);
//   };

//   const handleRemoveSoftware = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       softwareInformation: prev.softwareInformation.filter(
//         (_, i) => i !== index,
//       ),
//     }));
//   };

//   return (
//     <Dialog open={isOpen} onOpenChange={handleOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         {/* <DialogHeader> */}
//         <DialogHeader className="pb-6">

//           <DialogTitle>
//             {mode === "create" ? "Create New Company" : "Edit Company"}
//           </DialogTitle>
//           <DialogDescription>
//             {mode === "create"
//               ? "Add a new company to the system"
//               : "Update company details"}
//           </DialogDescription>
//         </DialogHeader>
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="code">Company Code</Label>
//               <Input
//                 id="code"
//                 value={formData.code}
//                 readOnly
//                 className="bg-muted/50 font-mono text-sm"
//               />
//               <p className="text-xs text-muted-foreground">
//                 Auto-generated unique identifier
//               </p>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="companyName">Company Name *</Label>
//               <div className="relative">
//                 <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="companyName"
//                   placeholder="Enter company name"
//                   value={formData.companyName}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       companyName: e.target.value,
//                     }))
//                   }
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="city">City *</Label>
//             <div className="relative">
//               <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//               <Input
//                 id="city"
//                 placeholder="Enter city"
//                 value={formData.city}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, city: e.target.value }))
//                 }
//                 className="pl-10"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="phoneNumber">Phone Number *</Label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="phoneNumber"
//                   type="tel"
//                   placeholder="Enter phone number"
//                   value={formData.phoneNumber}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       phoneNumber: e.target.value,
//                     }))
//                   }
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="address">Address *</Label>
//               <div className="relative">
//                 <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   id="address"
//                   placeholder="Enter address"
//                   value={formData.address}
//                   onChange={(e) =>
//                     setFormData((prev) => ({
//                       ...prev,
//                       address: e.target.value,
//                     }))
//                   }
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2">
//             <div className="space-y-2">
//               <Label htmlFor="support">Support</Label>
//               <Select
//                 value={formData.support}
//                 onValueChange={(value) =>
//                   setFormData((prev) => ({ ...prev, support: value }))
//                 }
//               >
//                 <SelectTrigger id="support">
//                   <SelectValue placeholder="Select support status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Active">Active</SelectItem>
//                   <SelectItem value="In-Active">In-Active</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="designatedDeveloper">Designated Developer</Label>
//               <Select
//                 value={formData.designatedDeveloper}
//                 onValueChange={(value) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     designatedDeveloper: value,
//                   }))
//                 }
//               >
//                 <SelectTrigger id="designatedDeveloper">
//                   <SelectValue placeholder="Select developer" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="N/A">N/A</SelectItem>
//                   {users.map((user) => (
//                     <SelectItem key={user._id} value={user.username}>
//                       {user.username}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="companyRepresentative">
//               Company Representative
//             </Label>
//             <div className="relative">
//               <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//               <Input
//                 id="companyRepresentative"
//                 placeholder="Enter company representative"
//                 value={formData.companyRepresentative}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     companyRepresentative: e.target.value,
//                   }))
//                 }
//                 className="pl-10"
//               />
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label>Software Information</Label>
//             <div className="space-y-4 p-3 border rounded-md bg-muted/10 max-h-[200px] overflow-y-auto">
//               {formData.softwareInformation.length > 0 ? (
//                 formData.softwareInformation.map((software, index) => (
//                   <div key={index} className="flex items-center gap-2">
//                     <div className="flex-1 grid gap-2 sm:grid-cols-3">
//                       <div>
//                         <Label className="text-xs">Type</Label>
//                         <Input
//                           value={software.softwareType}
//                           readOnly
//                           className="bg-muted/50 text-xs sm:text-sm"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-xs">Version</Label>
//                         <Input
//                           value={software.version}
//                           readOnly
//                           className="bg-muted/50 text-xs sm:text-sm"
//                         />
//                       </div>
//                       <div>
//                         <Label className="text-xs">Last Updated</Label>
//                         <Input
//                           value={new Date(
//                             software.lastUpdated,
//                           ).toLocaleDateString()}
//                           readOnly
//                           className="bg-muted/50 text-xs sm:text-sm"
//                         />
//                       </div>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => handleRemoveSoftware(index)}
//                       disabled={isLoading}
//                       className="p-1"
//                     >
//                       <Trash2 className="h-4 w-4 text-red-600" />
//                     </Button>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-xs sm:text-sm text-muted-foreground">
//                   No software information added.
//                 </p>
//               )}
//             </div>
//           </div>

//           <Dialog
//             open={softwareDialogOpen}
//             onOpenChange={setSoftwareDialogOpen}
//           >
//             <DialogTrigger asChild>
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
//               >
//                 <Package className="h-4 w-4 mr-2" />
//                 Add Software
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Add Software Information</DialogTitle>
//               </DialogHeader>
//               <form onSubmit={handleSoftwareSubmit} className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="softwareType">Software Type</Label>
//                   <Select
//                     value={softwareInfo.softwareType}
//                     onValueChange={(value) =>
//                       setSoftwareInfo((prev) => ({
//                         ...prev,
//                         softwareType: value,
//                       }))
//                     }
//                   >
//                     <SelectTrigger id="softwareType">
//                       <SelectValue
//                         placeholder={
//                           softwareTypesLoading
//                             ? "Loading software types..."
//                             : "Select software type"
//                         }
//                       />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {softwareTypeOptions.map((type) => (
//                         <SelectItem key={type} value={type}>
//                           {type}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="version">Version</Label>
//                   <Select
//                     value={softwareInfo.version}
//                     onValueChange={(value) =>
//                       setSoftwareInfo((prev) => ({ ...prev, version: value }))
//                     }
//                   >
//                     <SelectTrigger id="version">
//                       <SelectValue placeholder="Select version" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="v1.00">v1.00</SelectItem>
//                       <SelectItem value="v2.00">v2.00</SelectItem>
//                       <SelectItem value="v3.00">v3.00</SelectItem>
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="lastUpdated">Last Updated</Label>
//                   <Input
//                     id="lastUpdated"
//                     type="date"
//                     value={softwareInfo.lastUpdated}
//                     onChange={(e) =>
//                       setSoftwareInfo((prev) => ({
//                         ...prev,
//                         lastUpdated: e.target.value,
//                       }))
//                     }
//                     required
//                   />
//                 </div>
//                 <div className="flex gap-2">
//                   <Button type="submit" className="flex-1">
//                     Add Software
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outline"
//                     onClick={() => setSoftwareDialogOpen(false)}
//                   >
//                     Cancel
//                   </Button>
//                 </div>
//               </form>
//             </DialogContent>
//           </Dialog>

//           <div className="flex gap-2 pt-4">
//             <Button type="submit" className="flex-1" disabled={isLoading}>
//               {isLoading ? (
//                 <div className="flex items-center gap-2">
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   {mode === "create" ? "Creating..." : "Saving..."}
//                 </div>
//               ) : mode === "create" ? (
//                 "Create Company"
//               ) : (
//                 "Save Changes"
//               )}
//             </Button>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => handleOpenChange(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
// components/company/CompanyForm.tsx

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building,
  MapPin,
  Phone,
  User,
  Package,
  Trash2,
  Loader2,
} from "lucide-react";

interface SoftwareInfo {
  softwareType: string;
  version: string;
  lastUpdated: string;
}

interface Company {
  _id?: string;
  code: string;
  companyName: string;
  city: string;
  phoneNumber: string;
  address: string;
  remarks?: string;
  support: string;
  designatedDeveloper: string;
  companyRepresentative: string;
  softwareInformation: SoftwareInfo[];
}

interface CompanyFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (companyData: Omit<Company, "_id">) => Promise<void>;
  isLoading: boolean;
  users: any[];
  initialData?: Company;
  mode: "create" | "edit";
}

export function CompanyForm({
  isOpen,
  onOpenChange,
  onSubmit,
  isLoading,
  users,
  initialData,
  mode,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<Omit<Company, "_id">>({
    code: `CMP-${Date.now()}`,
    companyName: "",
    city: "",
    phoneNumber: "",
    address: "",
    remarks: "",
    support: "Active",
    designatedDeveloper: "N/A",
    companyRepresentative: "N/A",
    softwareInformation: [],
  });

  const [softwareDialogOpen, setSoftwareDialogOpen] = useState(false);
  const [softwareInfo, setSoftwareInfo] = useState({
    softwareType: "Finance Manager",
    version: "v1.00",
    lastUpdated: new Date().toISOString().slice(0, 10),
  });

  // Software types are managed by the Administrator (Dashboard → Software
  // Types) and stored in the database. Only Active types are ever returned.
  const [softwareTypeOptions, setSoftwareTypeOptions] = useState<string[]>([]);
  const [softwareTypesLoading, setSoftwareTypesLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/software-types")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const names: string[] = Array.isArray(data.softwareTypes)
          ? data.softwareTypes.map((t: { name: string }) => t.name)
          : [];
        setSoftwareTypeOptions(names);
        // Keep the default selection valid once real options arrive.
        if (names.length > 0) {
          setSoftwareInfo((prev) =>
            names.includes(prev.softwareType)
              ? prev
              : { ...prev, softwareType: names[0] },
          );
        }
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

  // Reset form when initialData changes or dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setFormData({ remarks: "", ...initialData });
      } else {
        setFormData({
          code: `CMP-${Date.now()}`,
          companyName: "",
          city: "",
          phoneNumber: "",
          address: "",
          remarks: "",
          support: "Active",
          designatedDeveloper: "N/A",
          companyRepresentative: "N/A",
          softwareInformation: [],
        });
      }
    }
  }, [isOpen, initialData, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate mandatory fields. Company ID (auto-generated code) and
    // Company Name are required; City, Mobile Number, Address, and
    // Remarks remain optional — the server enforces duplicate prevention
    // on Company ID / Company Name for both manual and XLSX-imported
    // companies.
    if (!formData.companyName?.trim()) {
      alert("Company Name is required");
      return;
    }

    await onSubmit(formData);

    // Only reset form after successful creation
    if (mode === "create") {
      setFormData({
        code: `CMP-${Date.now()}`,
        companyName: "",
        city: "",
        phoneNumber: "",
        address: "",
        remarks: "",
        support: "Active",
        designatedDeveloper: "N/A",
        companyRepresentative: "N/A",
        softwareInformation: [],
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
  };

  const handleSoftwareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedSoftware = [
      ...formData.softwareInformation,
      {
        ...softwareInfo,
        lastUpdated: new Date(softwareInfo.lastUpdated).toISOString(),
      },
    ];

    setFormData((prev) => ({ ...prev, softwareInformation: updatedSoftware }));
    setSoftwareInfo({
      softwareType: "Finance Manager",
      version: "v1.00",
      lastUpdated: new Date().toISOString().slice(0, 10),
    });
    setSoftwareDialogOpen(false);
  };

  const handleRemoveSoftware = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      softwareInformation: prev.softwareInformation.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* <DialogHeader> */}
        <DialogHeader className="pb-6">

          <DialogTitle>
            {mode === "create" ? "Create New Company" : "Edit Company"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new company to the system"
              : "Update company details"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="code">Company Code</Label>
              <Input
                id="code"
                value={formData.code}
                readOnly
                className="bg-muted/50 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Auto-generated unique identifier
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="companyName"
                  placeholder="Enter company name"
                  value={formData.companyName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      companyName: e.target.value,
                    }))
                  }
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="city"
                placeholder="Enter city (optional)"
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, city: e.target.value }))
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Mobile / Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter mobile number (optional)"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="address"
                  placeholder="Enter address (optional)"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Input
              id="remarks"
              placeholder="Enter remarks (optional)"
              value={formData.remarks || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, remarks: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support">Support</Label>
              <Select
                value={formData.support}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, support: value }))
                }
              >
                <SelectTrigger id="support">
                  <SelectValue placeholder="Select support status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="In-Active">In-Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designatedDeveloper">Designated Developer</Label>
              <Select
                value={formData.designatedDeveloper}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    designatedDeveloper: value,
                  }))
                }
              >
                <SelectTrigger id="designatedDeveloper">
                  <SelectValue placeholder="Select developer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N/A">N/A</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user.username}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyRepresentative">
              Company Representative
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="companyRepresentative"
                placeholder="Enter company representative"
                value={formData.companyRepresentative}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    companyRepresentative: e.target.value,
                  }))
                }
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Software Information</Label>
            <div className="space-y-4 p-3 border rounded-md bg-muted/10 max-h-[200px] overflow-y-auto">
              {formData.softwareInformation.length > 0 ? (
                formData.softwareInformation.map((software, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="flex-1 grid gap-2 sm:grid-cols-3">
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Input
                          value={software.softwareType}
                          readOnly
                          className="bg-muted/50 text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Version</Label>
                        <Input
                          value={software.version}
                          readOnly
                          className="bg-muted/50 text-xs sm:text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Last Updated</Label>
                        <Input
                          value={new Date(
                            software.lastUpdated,
                          ).toLocaleDateString()}
                          readOnly
                          className="bg-muted/50 text-xs sm:text-sm"
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSoftware(index)}
                      disabled={isLoading}
                      className="p-1"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground">
                  No software information added.
                </p>
              )}
            </div>
          </div>

          <Dialog
            open={softwareDialogOpen}
            onOpenChange={setSoftwareDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
              >
                <Package className="h-4 w-4 mr-2" />
                Add Software
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Software Information</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSoftwareSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="softwareType">Software Type</Label>
                  <Select
                    value={softwareInfo.softwareType}
                    onValueChange={(value) =>
                      setSoftwareInfo((prev) => ({
                        ...prev,
                        softwareType: value,
                      }))
                    }
                  >
                    <SelectTrigger id="softwareType">
                      <SelectValue
                        placeholder={
                          softwareTypesLoading
                            ? "Loading software types..."
                            : "Select software type"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {softwareTypeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version</Label>
                  <Select
                    value={softwareInfo.version}
                    onValueChange={(value) =>
                      setSoftwareInfo((prev) => ({ ...prev, version: value }))
                    }
                  >
                    <SelectTrigger id="version">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1.00">v1.00</SelectItem>
                      <SelectItem value="v2.00">v2.00</SelectItem>
                      <SelectItem value="v3.00">v3.00</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastUpdated">Last Updated</Label>
                  <Input
                    id="lastUpdated"
                    type="date"
                    value={softwareInfo.lastUpdated}
                    onChange={(e) =>
                      setSoftwareInfo((prev) => ({
                        ...prev,
                        lastUpdated: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Add Software
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSoftwareDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Saving..."}
                </div>
              ) : mode === "create" ? (
                "Create Company"
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
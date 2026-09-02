// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Building, Archive, Edit, Trash2, FileText } from "lucide-react";
// import type { CombinedItem } from "@/hooks/useUnpostTask";

// interface UnpostTableProps {
//   items: CombinedItem[];
//   currentItems: CombinedItem[];
//   currentPage: number;
//   totalPages: number;
//   onEditTask: (item: CombinedItem) => void;
//   onDeleteItem: (item: CombinedItem) => void;
//   onPageChange: (page: number) => void;
// }

// export function UnpostTable({
//   items,
//   currentItems,
//   currentPage,
//   totalPages,
//   onEditTask,
//   onDeleteItem,
//   onPageChange,
// }: UnpostTableProps) {
//   const getCompanyName = (item: CombinedItem) => {
//     if (item.type === 'task') {
//       return item.company?.name || "N/A";
//     } else {
//       // For complaints, use contact person as company name or default
//       return "Online Complaint";
//     }
//   };

//   return (
//     <Card>
//       <CardHeader className="py-4 bg-orange-50">
//         <div className="flex flex-col items-start gap-4">
//           <CardTitle className="flex items-center gap-2 text-lg text-orange-700">
//             <Archive className="h-4 w-4" />
//             Tasks & Complaints ({items.length})
//           </CardTitle>
//           <CardDescription className="text-sm">
//             Edit/Unpost tasks and delete any items
//           </CardDescription>
//         </div>
//       </CardHeader>
//       <CardContent className="p-0">
//         {items.length === 0 ? (
//           <div className="text-center py-8 text-muted-foreground">
//             <Archive className="h-12 w-12 mx-auto mb-3 opacity-50" />
//             <p className="text-base font-medium">No items available</p>
//             <p className="text-xs">Items will appear here once available</p>
//           </div>
//         ) : (
//           <>
//             <div className="responsive-table max-h-96 overflow-y-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-orange-50 border-b sticky top-0">
//                   <tr>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       Type
//                     </th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       Code/Number
//                     </th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       Company
//                     </th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       City
//                     </th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       Address
//                     </th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       Work/Software Type
//                     </th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       Status
//                     </th>
//                     <th className="px-3 py-2 text-left text-xs font-medium text-orange-700 uppercase">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-100">
//                   {currentItems.map((item, index) => (
//                     <tr
//                       key={`${item.type}-${item._id}`}
//                       className={`${
//                         index % 2 === 0 ? "bg-white" : "bg-orange-50/30"
//                       } hover:bg-orange-100 transition-colors`}
//                     >
//                       <td className="px-3 py-2">
//                         <Badge
//                           className={`text-xs ${
//                             item.type === 'task' 
//                               ? 'bg-primary' 
//                               : 'bg-purple-600'
//                           }`}
//                         >
//                           {item.type === 'task' ? 'Task' : 'Complaint'}
//                         </Badge>
//                       </td>
//                       <td className="px-3 py-2">
//                         <Badge
//                           variant="outline"
//                           className="text-xs font-mono border-orange-300"
//                         >
//                           {item.type === 'task' 
//                             ? item.code?.split("-")[1] || item.code
//                             : item.complaintNumber?.split("-")[1] || item.complaintNumber
//                           }
//                         </Badge>
//                       </td>
//                       <td className="px-3 py-2">
//                         <div className="flex items-center">
//                           <Building className="h-3 w-3 text-muted-foreground/70 mr-1" />
//                           <span
//                             className="font-medium text-foreground truncate max-w-[80px] sm:max-w-24"
//                             title={getCompanyName(item)}
//                           >
//                             {getCompanyName(item)}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-3 py-2">
//                         <span className="text-foreground text-xs">
//                           {item.company?.city || "N/A"}
//                         </span>
//                       </td>
//                       <td className="px-3 py-2">
//                         <span
//                           className="text-foreground truncate max-w-[100px] block text-xs"
//                           title={item.company?.address || "N/A"}
//                         >
//                           {item.company?.address || "N/A"}
//                         </span>
//                       </td>
//                       <td className="px-3 py-2">
//                         <span
//                           className="text-foreground truncate max-w-[100px] block text-xs"
//                           title={item.type === 'task' ? item.working || "N/A" : item.softwareType || "N/A"}
//                         >
//                           {item.type === 'task' ? item.working || "N/A" : item.softwareType || "N/A"}
//                         </span>
//                       </td>
//                       <td className="px-3 py-2">
//                         <Badge className="bg-green-600 text-xs">
//                           {item.status || "N/A"}
//                         </Badge>
//                       </td>
//                       <td className="px-3 py-2">
//                         <div className="flex space-x-2">
//                           {item.type === 'task' ? (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               onClick={() => onEditTask(item)}
//                               className="text-orange-600 border-orange-300 hover:bg-orange-100"
//                             >
//                               <Edit className="h-3 w-3 mr-1" />
//                               Edit
//                             </Button>
//                           ) : (
//                             <Button
//                               size="sm"
//                               variant="outline"
//                               disabled
//                               className="text-muted-foreground/70 border-border cursor-not-allowed"
//                             >
//                               <FileText className="h-3 w-3 mr-0" />
//                               View
//                             </Button>
//                           )}
//                           <Button
//                             size="sm"
//                             variant="destructive"
//                             onClick={() => onDeleteItem(item)}
//                           >
//                             <Trash2 className="h-3 w-3 mr-1" />
//                             Delete
//                           </Button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="flex items-center justify-between p-4 border-t">
//               <Button
//                 onClick={() => onPageChange(currentPage - 1)}
//                 disabled={currentPage === 1}
//                 variant="outline"
//                 size="sm"
//               >
//                 Previous
//               </Button>

//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-muted-foreground">
//                   Page {currentPage} of {totalPages}
//                 </span>
//               </div>

//               <Button
//                 onClick={() => onPageChange(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//                 variant="outline"
//                 size="sm"
//               >
//                 Next
//               </Button>
//             </div>
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Archive, Edit, Trash2, FileText } from "lucide-react";
import type { CombinedItem } from "@/hooks/useUnpostTask";

interface UnpostTableProps {
  items: CombinedItem[];
  currentItems: CombinedItem[];
  currentPage: number;
  totalPages: number;
  onEditTask: (item: CombinedItem) => void;
  onDeleteItem: (item: CombinedItem) => void;
  onPageChange: (page: number) => void;
}

export function UnpostTable({
  items,
  currentItems,
  currentPage,
  totalPages,
  onEditTask,
  onDeleteItem,
  onPageChange,
}: UnpostTableProps) {
  const getCompanyName = (item: CombinedItem) => {
    if (item.type === 'task') {
      return item.company?.name || "N/A";
    } else {
      // For complaints, use contact person as company name or default
      return "Online Complaint";
    }
  };

  return (
    <Card 
      className="border-0 shadow-xl"
      style={{ 
        background: 'linear-gradient(135deg, #FEFFFF, #F0F7FF)'
      }}
    >
      <CardHeader 
        className="border-0 pt-4 pb-4"
        style={{ 
          background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.2), rgba(17, 81, 155, 0.1))',
          borderBottomColor: 'rgba(158, 195, 249, 0.3)'
        }}
      >
        <div className="flex flex-col items-start gap-4">
          <CardTitle className="flex items-center gap-2 text-lg text-[#000000]">
            <Archive className="h-4 w-4" style={{ color: '#11519B' }} />
            Tasks & Complaints ({items.length})
          </CardTitle>
          <CardDescription className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>
            Edit/Unpost tasks and delete any items
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="text-center py-8 bg-[#FEFFFF]">
            <Archive className="h-12 w-12 mx-auto mb-3" style={{ opacity: 0.5, color: '#11519B' }} />
            <p className="text-base font-medium text-[#000000]" style={{ opacity: 0.6 }}>No items available</p>
            <p className="text-xs text-[#000000]" style={{ opacity: 0.5 }}>Items will appear here once available</p>
          </div>
        ) : (
          <>
            <div className="responsive-table max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead 
                  className="border-b sticky top-0"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(158, 195, 249, 0.15), rgba(17, 81, 155, 0.05))'
                  }}
                >
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Code/Number
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Company
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      City
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Address
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Work/Software Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Status
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-[#000000]" style={{ opacity: 0.6 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgba(158, 195, 249, 0.3)' }}>
                  {currentItems.map((item, index) => (
                    <tr
                      key={`${item.type}-${item._id}`}
                      className="transition-colors"
                      style={{ 
                        backgroundColor: index % 2 === 0 ? '#FEFFFF' : 'rgba(240, 247, 255, 0.5)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(240, 247, 255, 0.8)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FEFFFF' : 'rgba(240, 247, 255, 0.5)'
                      }}
                    >
                      <td className="px-3 py-2">
                        <Badge
                          className="text-xs text-white"
                          style={{
                            backgroundColor: item.type === 'task' ? '#11519B' : '#114A9B'
                          }}
                        >
                          {item.type === 'task' ? 'Task' : 'Complaint'}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-mono"
                          style={{ 
                            borderColor: 'rgba(17, 81, 155, 0.3)',
                            color: '#11519B',
                            backgroundColor: 'rgba(17, 81, 155, 0.05)'
                          }}
                        >
                          {item.type === 'task' 
                            ? item.code?.split("-")[1] || item.code
                            : item.complaintNumber?.split("-")[1] || item.complaintNumber
                          }
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1" style={{ color: '#11519B', opacity: 0.6 }} />
                          <span
                            className="font-medium truncate max-w-[80px] sm:max-w-24 text-[#000000]"
                            title={getCompanyName(item)}
                          >
                            {getCompanyName(item)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className="text-[#000000] text-xs">
                          {item.company?.city || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="truncate max-w-[100px] block text-xs text-[#000000]"
                          title={item.company?.address || "N/A"}
                        >
                          {item.company?.address || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className="truncate max-w-[100px] block text-xs text-[#000000]"
                          title={item.type === 'task' ? item.working || "N/A" : item.softwareType || "N/A"}
                        >
                          {item.type === 'task' ? item.working || "N/A" : item.softwareType || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <Badge 
                          className="text-xs text-white"
                          style={{
                            backgroundColor: '#11519B'
                          }}
                        >
                          {item.status || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex space-x-2">
                          {item.type === 'task' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onEditTask(item)}
                              style={{ 
                                borderColor: 'rgba(17, 81, 155, 0.3)',
                                color: '#11519B'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(17, 81, 155, 0.05)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled
                              className="cursor-not-allowed"
                              style={{ 
                                borderColor: 'rgba(17, 81, 155, 0.2)',
                                color: '#000000',
                                opacity: 0.4
                              }}
                            >
                              <FileText className="h-3 w-3 mr-0" />
                              View
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => onDeleteItem(item)}
                            style={{
                              backgroundColor: '#DC2626'
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t" style={{ borderColor: 'rgba(158, 195, 249, 0.3)', backgroundColor: '#FEFFFF' }}>
              <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                style={{ 
                  borderColor: 'rgba(17, 81, 155, 0.3)',
                  color: '#11519B'
                }}
              >
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#000000]" style={{ opacity: 0.6 }}>
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                style={{ 
                  borderColor: 'rgba(17, 81, 155, 0.3)',
                  color: '#11519B'
                }}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
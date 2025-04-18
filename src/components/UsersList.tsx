// import React, { useState, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '../lib/hooks';
// import {
//   fetchUsers,
//   setSelectedUser,
//   setSearchTerm
// } from '../lib/store/usersSlice';
// import { User } from '../lib/types';
// import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { ITEMS_PER_PAGE } from '../lib/constants';

// export default function UsersList() {
//   const dispatch = useAppDispatch();
//   const { list: users, selectedUserId, searchTerm, isLoading } = useAppSelector((state) => state.ui);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortField, setSortField] = useState<keyof User>('name');
//   const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

//   useEffect(() => {
//     dispatch(fetchUsers());
//   }, [dispatch]);

//   const handleUserSelect = (userId: string) => {
//     dispatch(setSelectedUser(userId));
//   };

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     dispatch(setSearchTerm(e.target.value));
//     setCurrentPage(1); // Reset to first page when searching
//   };

//   const handleSort = (field: keyof User) => {
//     if (sortField === field) {
//       setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setSortField(field);
//       setSortDirection('asc');
//     }
//   };

//   // Filter and sort users
//   const filteredUsers = useAppSelector((state) => {
//     return state.users.list.filter((user) => {
//       if (!state.users.searchTerm) return true;

//       const term = state.users.searchTerm.toLowerCase();
//       return (
//         user.name.toLowerCase().includes(term) ||
//         user.email.toLowerCase().includes(term) ||
//         user.role.toLowerCase().includes(term)
//       );
//     });
//   });

//   const sortedUsers = [...filteredUsers].sort((a, b) => {
//     if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
//     if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
//     return 0;
//   });

//   // Pagination logic
//   const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const paginatedUsers = sortedUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

//   const SortIcon = ({ field }: { field: keyof User }) => {
//     if (sortField !== field) return null;
//     return sortDirection === 'asc' ? (
//       <ChevronRight className="h-4 w-4" />
//     ) : (
//       <ChevronLeft className="h-4 w-4" />
//     );
//   };

//   return (
//     <div className="h-full flex flex-col">
//       <div className="p-4 border-b border-border">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             className="pl-10"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={handleSearch}
//           />
//         </div>
//       </div>

//       <div className="flex-1 overflow-auto">
//         {isLoading ? (
//           <div className="flex items-center justify-center h-full">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
//           </div>
//         ) : (
//           <table className="w-full">
//             <thead className="bg-secondary sticky top-0">
//               <tr>
//                 <th
//                   className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
//                   onClick={() => handleSort('name')}
//                 >
//                   <div className="flex items-center">
//                     Name <SortIcon field="name" />
//                   </div>
//                 </th>
//                 <th
//                   className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
//                   onClick={() => handleSort('email')}
//                 >
//                   <div className="flex items-center">
//                     Email <SortIcon field="email" />
//                   </div>
//                 </th>
//                 <th
//                   className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
//                   onClick={() => handleSort('role')}
//                 >
//                   <div className="flex items-center">
//                     Role <SortIcon field="role" />
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedUsers.map((user) => (
//                 <tr
//                   key={user.id}
//                   className={`border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors ${
//                     user.id === selectedUserId ? 'bg-secondary' : ''
//                   }`}
//                   onClick={() => handleUserSelect(user.id)}
//                 >
//                   <td className="px-4 py-3 text-sm">{user.name}</td>
//                   <td className="px-4 py-3 text-sm">{user.email}</td>
//                   <td className="px-4 py-3 text-sm">
//                     <span className={`capitalize inline-block px-2 py-1 rounded-full text-xs ${
//                       user.role === 'admin'
//                         ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
//                         : user.role === 'editor'
//                         ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
//                         : user.role === 'viewer'
//                         ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
//                         : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
//                     }`}>
//                       {user.role}
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//               {paginatedUsers.length === 0 && (
//                 <tr>
//                   <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
//                     No users found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         )}
//       </div>

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="p-4 border-t border-border flex items-center justify-between">
//           <div className="text-sm text-muted-foreground">
//             Showing {startIndex + 1}-{Math.min(startIndex + ITEMS_PER_PAGE, sortedUsers.length)} of{' '}
//             {sortedUsers.length} users
//           </div>
//           <div className="flex items-center space-x-2">
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//               disabled={currentPage === 1}
//             >
//               <ChevronLeft className="h-4 w-4" />
//               <span className="sr-only">Previous page</span>
//             </Button>
//             <div className="text-sm font-medium">
//               {currentPage} / {totalPages}
//             </div>
//             <Button
//               variant="outline"
//               size="icon"
//               onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
//               disabled={currentPage === totalPages}
//             >
//               <ChevronRight className="h-4 w-4" />
//               <span className="sr-only">Next page</span>
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// src/components/UsersList.tsx
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../lib/hooks";
import {
  fetchUsers,
  setSelectedUser,
  setSearchTerm,
} from "../lib/store/usersSlice";
import { User } from "../lib/types";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ITEMS_PER_PAGE } from "../lib/constants";

export default function UsersList() {
  const dispatch = useAppDispatch();
  // Fix: Change state.ui to state.users
  const {
    list: users,
    selectedUserId,
    searchTerm,
    isLoading,
  } = useAppSelector((state) => state.users);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleUserSelect = (userId: string) => {
    dispatch(setSelectedUser(userId));
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchTerm(e.target.value));
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Fix: Update filteredUsers to use state.users
  const filteredUsers = useAppSelector((state) => {
    return state.users.list.filter((user) => {
      if (!state.users.searchTerm) return true;

      const term = state.users.searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
      );
    });
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = sortedUsers.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const SortIcon = ({ field }: { field: keyof User }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronRight className="h-4 w-4" />
    ) : (
      <ChevronLeft className="h-4 w-4" />
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-secondary sticky top-0">
              <tr>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name <SortIcon field="name" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                  onClick={() => handleSort("email")}
                >
                  <div className="flex items-center">
                    Email <SortIcon field="email" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-semibold cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center">
                    Role <SortIcon field="role" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-border hover:bg-secondary/50 cursor-pointer transition-colors ${
                    user.id === selectedUserId ? "bg-secondary" : ""
                  }`}
                  onClick={() => handleUserSelect(user.id)}
                >
                  <td className="px-4 py-3 text-sm">{user.name}</td>
                  <td className="px-4 py-3 text-sm">{user.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`capitalize inline-block px-2 py-1 rounded-full text-xs ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          : user.role === "editor"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : user.role === "viewer"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                          : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-
            {Math.min(startIndex + ITEMS_PER_PAGE, sortedUsers.length)} of{" "}
            {sortedUsers.length} users
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm font-medium">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

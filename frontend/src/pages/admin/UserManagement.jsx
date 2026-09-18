import React from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Plus, Search, Shield, Edit, Trash2 } from 'lucide-react';

export default function UserManagement() {
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@famehub.com', role: 'ROLE_ADMIN', status: 'Active', joined: 'Oct 15, 2023' },
    { id: 2, name: 'HR Manager', email: 'hr@famehub.com', role: 'ROLE_HR', status: 'Active', joined: 'Oct 16, 2023' },
    { id: 3, name: 'Alex River', email: 'alex@example.com', role: 'ROLE_CANDIDATE', status: 'Active', joined: 'Oct 20, 2023' },
    { id: 4, name: 'Inactive Candidate', email: 'old@example.com', role: 'ROLE_CANDIDATE', status: 'Suspended', joined: 'Sep 10, 2023' }
  ];

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ROLE_ADMIN': return <Badge variant="danger">Administrator</Badge>;
      case 'ROLE_HR': return <Badge variant="warning">HR Manager</Badge>;
      default: return <Badge variant="neutral">Candidate</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">User Management</h1>
          <p className="text-slate-600 mt-1">Manage user accounts and role-based access control.</p>
        </div>
        <Button variant="primary" className="gap-2">
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              className="w-full bg-surface-muted border border-secondary/50 rounded-lg pl-10 pr-4 py-2 text-sm text-primary focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2"><Shield className="w-4 h-4"/> Filter by Role</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Details</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map(user => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#08566E] flex items-center justify-center font-bold text-primary">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-primary">{user.name}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(user.role)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">{user.joined}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="px-2"><Edit className="w-4 h-4 text-primary" /></Button>
                      <Button variant="ghost" size="sm" className="px-2"><Trash2 className="w-4 h-4 text-primary" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

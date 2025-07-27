import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, X, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { AppointmentWithDetails, Doctor } from "@shared/schema";

interface AppointmentManagementProps {
  onNewAppointment: () => void;
}

export default function AppointmentManagement({ onNewAppointment }: AppointmentManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("all");

  const today = new Date().toISOString().split('T')[0];

  const { data: appointments = [], isLoading } = useQuery<AppointmentWithDetails[]>({
    queryKey: ["/api/appointments", today],
    queryFn: () => fetch(`/api/appointments?date=${today}`).then(res => res.json()),
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("PUT", `/api/appointments/${id}`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Appointment Cancelled",
        description: "The appointment has been cancelled successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.patient.phone.includes(searchTerm);
    const matchesDoctor = selectedDoctor === "all" || appointment.doctor.id === selectedDoctor;
    return matchesSearch && matchesDoctor;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      case "in-progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      case "cancelled":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm border border-slate-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-slate-900">Today's Appointments</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Doctors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Doctors</SelectItem>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={onNewAppointment}
              className="bg-medical-blue hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Appointment
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">
              {searchTerm || selectedDoctor ? "No matching appointments found" : "No appointments scheduled for today"}
            </p>
            <Button 
              onClick={onNewAppointment}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Appointment
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-medium text-slate-500 uppercase tracking-wider">Time</TableHead>
                  <TableHead className="font-medium text-slate-500 uppercase tracking-wider">Patient</TableHead>
                  <TableHead className="font-medium text-slate-500 uppercase tracking-wider">Doctor</TableHead>
                  <TableHead className="font-medium text-slate-500 uppercase tracking-wider">Type</TableHead>
                  <TableHead className="font-medium text-slate-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-medium text-slate-500 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      {new Date(`1970-01-01T${appointment.appointmentTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900">{appointment.patient.name}</div>
                        <div className="text-sm text-slate-500">{appointment.patient.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-900">{appointment.doctor.name}</TableCell>
                    <TableCell className="text-slate-900 capitalize">{appointment.type}</TableCell>
                    <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-medical-blue hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-alert-red hover:text-red-600"
                          onClick={() => cancelAppointmentMutation.mutate(appointment.id)}
                          disabled={cancelAppointmentMutation.isPending}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Doctor } from "@shared/schema";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AppointmentFormData {
  patientName: string;
  patientPhone: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  type: string;
  notes: string;
}

export default function BookAppointmentModal({ isOpen, onClose }: BookAppointmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    patientName: "",
    patientPhone: "",
    doctorId: "",
    appointmentDate: "",
    appointmentTime: "",
    type: "",
    notes: "",
  });

  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      return apiRequest("POST", "/api/appointments", {
        patientData: {
          name: data.patientName,
          phone: data.patientPhone,
        },
        appointmentData: {
          doctorId: data.doctorId,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          type: data.type,
          notes: data.notes,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Appointment Booked",
        description: "The appointment has been scheduled successfully.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to book appointment.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      patientName: "",
      patientPhone: "",
      doctorId: "",
      appointmentDate: "",
      appointmentTime: "",
      type: "",
      notes: "",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    bookAppointmentMutation.mutate(formData);
  };

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
  ];

  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Book New Appointment
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Schedule a new appointment by selecting a doctor, date, time, and providing patient information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="patientName" className="text-sm font-medium text-slate-700">
                Patient Name
              </Label>
              <Input
                id="patientName"
                type="text"
                required
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                placeholder="Enter patient name"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="patientPhone" className="text-sm font-medium text-slate-700">
                Contact Number
              </Label>
              <Input
                id="patientPhone"
                type="tel"
                required
                value={formData.patientPhone}
                onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                placeholder="(555) 123-4567"
                className="mt-2"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="doctor" className="text-sm font-medium text-slate-700">
              Select Doctor
            </Label>
            <Select 
              value={formData.doctorId} 
              onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-slate-700">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                required
                min={getMinDate()}
                value={formData.appointmentDate}
                onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="time" className="text-sm font-medium text-slate-700">
                Time
              </Label>
              <Select 
                value={formData.appointmentTime} 
                onValueChange={(value) => setFormData({ ...formData, appointmentTime: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      {new Date(`1970-01-01T${time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="type" className="text-sm font-medium text-slate-700">
              Appointment Type
            </Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="follow-up">Follow-up</SelectItem>
                <SelectItem value="physical-exam">Physical Exam</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-slate-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or special instructions"
              rows={3}
              className="mt-2"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={bookAppointmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-medical-blue hover:bg-blue-600 text-white"
              disabled={bookAppointmentMutation.isPending}
            >
              {bookAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Plus, Calendar, CalendarCheck, Settings, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Doctor } from "@shared/schema";

interface DoctorManagementProps {
  onBookAppointment: () => void;
}

export default function DoctorManagement({ onBookAppointment }: DoctorManagementProps) {
  const { data: doctors = [], isLoading } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-sm border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Available Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-300 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-300 rounded w-20"></div>
                        <div className="h-3 bg-slate-300 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Doctors */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-slate-900">Available Doctors</CardTitle>
            <Button variant="ghost" size="sm" className="text-medical-blue hover:text-blue-600">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {doctors.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-slate-500 text-sm">No doctors available</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div key={doctor.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-healthcare-green text-white flex items-center justify-center text-sm">
                    <i className="fas fa-user-md"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{doctor.name}</p>
                    <p className="text-xs text-slate-600">{doctor.specialization}</p>
                  </div>
                </div>
                <div 
                  className={`w-3 h-3 rounded-full ${
                    doctor.isAvailable ? "bg-green-400" : "bg-yellow-400"
                  }`} 
                  title={doctor.isAvailable ? "Available" : "Busy"}
                ></div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start p-3 h-auto"
            onClick={onBookAppointment}
          >
            <CalendarCheck className="w-5 h-5 text-medical-blue mr-3" />
            <span className="text-sm font-medium text-slate-900">Book Appointment</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 h-auto"
          >
            <Calendar className="w-5 h-5 text-healthcare-green mr-3" />
            <span className="text-sm font-medium text-slate-900">View Schedule</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 h-auto"
          >
            <Settings className="w-5 h-5 text-status-warning mr-3" />
            <span className="text-sm font-medium text-slate-900">Manage Doctors</span>
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start p-3 h-auto"
          >
            <BarChart className="w-5 h-5 text-slate-600 mr-3" />
            <span className="text-sm font-medium text-slate-900">Generate Reports</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

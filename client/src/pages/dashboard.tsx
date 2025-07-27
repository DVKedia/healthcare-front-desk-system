import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, UserCheck, AlertTriangle, Hospital } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import QueueManagement from "../components/queue-management";
import AppointmentManagement from "../components/appointment-management";
import DoctorManagement from "../components/doctor-management";
import AddWalkInModal from "../components/add-walkin-modal";
import BookAppointmentModal from "../components/book-appointment-modal";
import { useState } from "react";

interface Stats {
  queueTotal: number;
  todaysAppointments: number;
  availableDoctors: number;
  urgentCases: number;
}

export default function Dashboard() {
  const [isAddWalkInOpen, setIsAddWalkInOpen] = useState(false);
  const [isBookAppointmentOpen, setIsBookAppointmentOpen] = useState(false);

  const handleAddWalkIn = () => {
    setIsAddWalkInOpen(true);
  };

  const handleBookAppointment = () => {
    setIsBookAppointmentOpen(true);
  };

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (statsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-medical-blue mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Hospital className="h-8 w-8 text-medical-blue" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">HealthCare Front Desk</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                Sarah Johnson - Front Desk
              </div>
              <button className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors">
                <i className="fas fa-sign-out-alt text-slate-600"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-medical-blue" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600">Patients in Queue</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats?.queueTotal || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100">
                  <Calendar className="h-6 w-6 text-healthcare-green" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600">Today's Appointments</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats?.todaysAppointments || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100">
                  <UserCheck className="h-6 w-6 text-status-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600">Available Doctors</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats?.availableDoctors || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-alert-red" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-slate-600">Urgent Cases</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats?.urgentCases || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Queue Management */}
          <div className="lg:col-span-2">
            <QueueManagement onAddWalkIn={handleAddWalkIn} />
          </div>

          {/* Doctor Management Sidebar */}
          <div className="space-y-6">
            <DoctorManagement onBookAppointment={handleBookAppointment} />
          </div>
        </div>

        {/* Appointment Management Section */}
        <div className="mt-8">
          <AppointmentManagement onNewAppointment={handleBookAppointment} />
        </div>
      </div>

      {/* Modals */}
      <AddWalkInModal 
        isOpen={isAddWalkInOpen} 
        onClose={() => setIsAddWalkInOpen(false)} 
      />
      <BookAppointmentModal 
        isOpen={isBookAppointmentOpen} 
        onClose={() => setIsBookAppointmentOpen(false)} 
      />
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { QueueItemWithPatient } from "@shared/schema";

interface QueueManagementProps {
  onAddWalkIn: () => void;
}

export default function QueueManagement({ onAddWalkIn }: QueueManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queueItems = [], isLoading } = useQuery<QueueItemWithPatient[]>({
    queryKey: ["/api/queue"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return apiRequest("PUT", `/api/queue/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Status Updated",
        description: "Patient status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update patient status.",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Waiting</Badge>;
      case "with-doctor":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">With Doctor</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Patient Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-slate-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-300 rounded w-32"></div>
                      <div className="h-3 bg-slate-300 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="w-20 h-6 bg-slate-300 rounded"></div>
                </div>
              </div>
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
          <CardTitle className="text-lg font-semibold text-slate-900">Patient Queue</CardTitle>
          <Button 
            onClick={onAddWalkIn}
            className="bg-medical-blue hover:bg-blue-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Walk-in
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {queueItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">No patients in queue</p>
            <Button 
              onClick={onAddWalkIn}
              variant="outline"
              className="mt-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Patient
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {queueItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg border transition-shadow hover:shadow-md cursor-move ${
                  item.isUrgent 
                    ? "bg-red-50 border-red-200" 
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center font-semibold ${
                    item.isUrgent ? "bg-alert-red" : "bg-medical-blue"
                  }`}>
                    <span>{item.queueNumber.toString().padStart(2, '0')}</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{item.patient.name}</p>
                    <p className="text-sm text-slate-600">{item.reason}</p>
                    {item.isUrgent && (
                      <Badge variant="destructive" className="mt-1 text-xs">
                        URGENT
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(item.status)}
                  <Select
                    value={item.status}
                    onValueChange={(status) => 
                      updateStatusMutation.mutate({ id: item.id, status })
                    }
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="waiting">Waiting</SelectItem>
                      <SelectItem value="with-doctor">With Doctor</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

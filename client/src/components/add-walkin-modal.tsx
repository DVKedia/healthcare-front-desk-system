import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddWalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface WalkInFormData {
  name: string;
  phone: string;
  reason: string;
  isUrgent: boolean;
}

export default function AddWalkInModal({ isOpen, onClose }: AddWalkInModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<WalkInFormData>({
    name: "",
    phone: "",
    reason: "",
    isUrgent: false,
  });

  const addWalkInMutation = useMutation({
    mutationFn: async (data: WalkInFormData) => {
      return apiRequest("POST", "/api/queue", {
        patientData: {
          name: data.name,
          phone: data.phone,
        },
        queueData: {
          reason: data.reason,
          isUrgent: data.isUrgent,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/queue"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Patient Added",
        description: "Walk-in patient has been added to the queue successfully.",
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add patient to queue.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      phone: "",
      reason: "",
      isUrgent: false,
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addWalkInMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Add Walk-in Patient
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
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-slate-700">
              Patient Name
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter patient name"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
              Contact Number
            </Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="reason" className="text-sm font-medium text-slate-700">
              Reason for Visit
            </Label>
            <Select 
              value={formData.reason} 
              onValueChange={(value) => setFormData({ ...formData, reason: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general-checkup">General Checkup</SelectItem>
                <SelectItem value="follow-up">Follow-up Visit</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="vaccination">Vaccination</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="urgent"
              checked={formData.isUrgent}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isUrgent: checked as boolean })
              }
            />
            <Label htmlFor="urgent" className="text-sm text-slate-700">
              Mark as urgent
            </Label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={addWalkInMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-medical-blue hover:bg-blue-600 text-white"
              disabled={addWalkInMutation.isPending}
            >
              {addWalkInMutation.isPending ? "Adding..." : "Add to Queue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

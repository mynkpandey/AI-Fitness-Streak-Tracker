import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { X } from "lucide-react";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Create a schema for the form
const activitySchema = z.object({
  type: z.string().min(1, "Activity type is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  notes: z.string().optional(),
  completed: z.boolean().optional().default(true),
});

type ActivityFormValues = z.infer<typeof activitySchema>;

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const { toast } = useToast();
  
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "running",
      duration: 30,
      notes: "",
      completed: true
    },
  });
  
  const activityMutation = useMutation({
    mutationFn: async (data: ActivityFormValues) => {
      const response = await apiRequest("POST", "/api/activities", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Activity Added",
        description: "Your activity has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities/weekly"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add activity. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to add activity:", error);
    },
  });
  
  function onSubmit(data: ActivityFormValues) {
    activityMutation.mutate(data);
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-xl max-w-md w-full p-6">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-semibold text-gray-800">Add Activity</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 rounded-full">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Activity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full border border-gray-300 rounded-lg">
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="running">Running</SelectItem>
                      <SelectItem value="cycling">Cycling</SelectItem>
                      <SelectItem value="swimming">Swimming</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="weightTraining">Weight Training</SelectItem>
                      <SelectItem value="hiit">HIIT</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      className="w-full border border-gray-300 rounded-lg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg"
                      placeholder="Add details about your workout..."
                      value={field.value || ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition"
              disabled={activityMutation.isPending}
            >
              {activityMutation.isPending ? "Saving..." : "Save Activity"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

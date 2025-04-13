import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { insertWitnessSchema, Witness, Case } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extend the insert schema with validation rules
const witnessFormSchema = insertWitnessSchema.extend({
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  caseId: z.number({ required_error: "Case ID is required" }),
});

interface WitnessFormProps {
  witness?: Witness | null;
  onClose: () => void;
  caseId?: number | null;
}

export default function WitnessForm({ witness, onClose, caseId }: WitnessFormProps) {
  const { toast } = useToast();

  // Fetch cases for dropdown
  const { data: cases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const form = useForm<z.infer<typeof witnessFormSchema>>({
    resolver: zodResolver(witnessFormSchema),
    defaultValues: {
      caseId: witness?.caseId || caseId || undefined,
      firstName: witness?.firstName || "",
      lastName: witness?.lastName || "",
      contactPhone: witness?.contactPhone || "",
      contactEmail: witness?.contactEmail || "",
      relationship: witness?.relationship || "",
      reliability: witness?.reliability || "unknown",
      interviewStatus: witness?.interviewStatus || "pending",
      notes: witness?.notes || "",
    },
  });

  const createWitnessMutation = useMutation({
    mutationFn: async (values: z.infer<typeof witnessFormSchema>) => {
      return apiRequest("POST", "/api/witnesses", values);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${form.getValues().caseId}/witnesses`] });
      toast({
        title: "Witness Added",
        description: "Witness has been successfully added to the case.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to add witness",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateWitnessMutation = useMutation({
    mutationFn: async (values: z.infer<typeof witnessFormSchema>) => {
      if (!witness) throw new Error("No witness to update");
      return apiRequest("PUT", `/api/witnesses/${witness.id}`, values);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${form.getValues().caseId}/witnesses`] });
      toast({
        title: "Witness Updated",
        description: "Witness has been successfully updated.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to update witness",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof witnessFormSchema>) {
    if (witness) {
      updateWitnessMutation.mutate(values);
    } else {
      createWitnessMutation.mutate(values);
    }
  }

  const isPending = createWitnessMutation.isPending || updateWitnessMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="caseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value?.toString()}
                  disabled={!!caseId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {cases?.map(caseItem => (
                      <SelectItem key={caseItem.id} value={caseItem.id.toString()}>
                        {caseItem.title} (#{caseItem.caseNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="md:col-span-1"></div>
          
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="relationship"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Relationship to Case</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Neighbor, Family member, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="reliability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reliability Assessment</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reliability" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="under_assessment">Under Assessment</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="interviewStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interview Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Interview notes, observations, or other information" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-[#1A237E] hover:bg-[#1A237E]/90"
            disabled={isPending}
          >
            {isPending ? "Saving..." : witness ? "Update Witness" : "Add Witness"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

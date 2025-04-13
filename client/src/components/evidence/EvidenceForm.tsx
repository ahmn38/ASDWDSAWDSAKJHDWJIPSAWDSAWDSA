import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { insertEvidenceSchema, Evidence, Case } from "@shared/schema";
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
const evidenceFormSchema = insertEvidenceSchema.extend({
  evidenceNumber: z.string().min(3, { message: "Evidence number is required" }),
  type: z.string().min(1, { message: "Evidence type is required" }),
  caseId: z.number({ required_error: "Case ID is required" }),
});

interface EvidenceFormProps {
  evidence?: Evidence | null;
  onClose: () => void;
  caseId?: number | null;
}

export default function EvidenceForm({ evidence, onClose, caseId }: EvidenceFormProps) {
  const { toast } = useToast();

  // Fetch cases for dropdown
  const { data: cases } = useQuery<Case[]>({
    queryKey: ["/api/cases"],
  });

  const form = useForm<z.infer<typeof evidenceFormSchema>>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      caseId: evidence?.caseId || caseId || undefined,
      evidenceNumber: evidence?.evidenceNumber || generateEvidenceNumber(),
      type: evidence?.type || "",
      description: evidence?.description || "",
      location: evidence?.location || "",
      status: evidence?.status || "collected",
      collectedBy: evidence?.collectedBy || "",
      collectedAt: evidence?.collectedAt ? new Date(evidence.collectedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      notes: evidence?.notes || "",
    },
  });

  const createEvidenceMutation = useMutation({
    mutationFn: async (values: z.infer<typeof evidenceFormSchema>) => {
      // Format the date
      if (values.collectedAt) {
        values.collectedAt = new Date(values.collectedAt);
      }
      
      return apiRequest("POST", "/api/evidence", values);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${form.getValues().caseId}/evidence`] });
      toast({
        title: "Evidence Added",
        description: "Evidence has been successfully added to the case.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to add evidence",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEvidenceMutation = useMutation({
    mutationFn: async (values: z.infer<typeof evidenceFormSchema>) => {
      if (!evidence) throw new Error("No evidence to update");
      
      // Format the date
      if (values.collectedAt) {
        values.collectedAt = new Date(values.collectedAt);
      }
      
      return apiRequest("PUT", `/api/evidence/${evidence.id}`, values);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: [`/api/cases/${form.getValues().caseId}/evidence`] });
      toast({
        title: "Evidence Updated",
        description: "Evidence has been successfully updated.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to update evidence",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof evidenceFormSchema>) {
    if (evidence) {
      updateEvidenceMutation.mutate(values);
    } else {
      createEvidenceMutation.mutate(values);
    }
  }

  // Generate an evidence number with format CASE-YYYY-EXXX
  function generateEvidenceNumber() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `CASE-${year}-E${randomNum}`;
  }

  const isPending = createEvidenceMutation.isPending || updateEvidenceMutation.isPending;

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
          
          <FormField
            control={form.control}
            name="evidenceNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evidence Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Evidence Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Physical">Physical</SelectItem>
                    <SelectItem value="Document">Document</SelectItem>
                    <SelectItem value="Photo">Photo/Image</SelectItem>
                    <SelectItem value="Digital">Digital</SelectItem>
                    <SelectItem value="Biological">Biological</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
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
                    <SelectItem value="collected">Collected</SelectItem>
                    <SelectItem value="in_lab">In Lab</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location Found</FormLabel>
                <FormControl>
                  <Input placeholder="Where was the evidence found" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="collectedBy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collected By</FormLabel>
                <FormControl>
                  <Input placeholder="Name of collector" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="collectedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed description of the evidence" 
                  className="min-h-[100px]"
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
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any additional notes or information" 
                  className="min-h-[80px]"
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
            {isPending ? "Saving..." : evidence ? "Update Evidence" : "Add Evidence"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

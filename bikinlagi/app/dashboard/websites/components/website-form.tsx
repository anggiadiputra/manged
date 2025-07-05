'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { createClient } from '@/lib/auth-client';
import { Website } from '@/types/database';

const websiteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  description: z.string().optional(),
  hosting_provider: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance']),
  expiry_date: z.string().optional(),
  notes: z.string().optional(),
});

type WebsiteFormValues = z.infer<typeof websiteSchema>;

interface WebsiteFormProps {
  initialData?: Website;
}

export function WebsiteForm({ initialData }: WebsiteFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<WebsiteFormValues>({
    resolver: zodResolver(websiteSchema),
    defaultValues: initialData || {
      name: '',
      url: '',
      description: '',
      hosting_provider: '',
      status: 'active',
      notes: '',
    },
  });

  async function onSubmit(data: WebsiteFormValues) {
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      if (initialData) {
        const { error } = await supabase
          .from('websites')
          .update(data)
          .eq('id', initialData.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('websites')
          .insert([data]);
          
        if (error) throw error;
      }
      
      router.refresh();
      router.push('/dashboard/websites');
    } catch (error) {
      console.error('Error saving website:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} type="url" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="hosting_provider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hosting Provider</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="expiry_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : initialData ? 'Update Website' : 'Create Website'}
        </Button>
      </form>
    </Form>
  );
} 
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getCategoryImportTemplate, importStudentExcelData } from '@/routes/apiCategories';
import axios from 'axios';
import { useState } from 'react';
import { toast } from 'sonner';

interface ImportExcelDialogProps {
  onSuccess?: () => void;
}

export function ImportExcelDialog({ onSuccess }: ImportExcelDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file_import', file);

      await axios.post(importStudentExcelData().url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Categories imported successfully');
      setIsOpen(false);
      setFile(null);
      onSuccess?.();
    } catch (error) {
      console.error('Error importing categories:', error);
      toast.error('Failed to import categories');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Import Excel</Button>
      </DialogTrigger>
      <DialogContent className="sm">
        <DialogHeader>
          <DialogTitle>Import Excel</DialogTitle>
          <DialogDescription>
            Import Data From Excel File
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor="file-import">Template</Label>
            <p className="text-blue-500"><a href={getCategoryImportTemplate().url}>import-category-template.xlsx</a></p>
          </Field>
          <Field>
            <Label htmlFor="file_import">File Excel</Label>
            <Input
              type="file"
              id="file_import"
              name="file_import"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </Field>
        </FieldGroup>
        <DialogFooter >
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Importing...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

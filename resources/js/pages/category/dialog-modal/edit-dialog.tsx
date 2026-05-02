import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { update as updateCategory } from "@/routes/apiCategories"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup } from "@/components/ui/field"
import axios from 'axios';
import { CategoryForm } from "@/support/interfaces/request/createCategory"
import { Category } from "@/support/models/category"

interface EditDialogProps {
  isOpen: boolean
  onSuccess: () => void,
  category: Category | null,
  setOpen: (open: boolean) => void
}

export function EditDialog(
  { isOpen, onSuccess, category, setOpen }: EditDialogProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [formData, setFormData] = useState<CategoryForm>({
    name: "",
    desc: ""
  })

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        desc: category.desc || ""
      })
    }
  }, [category, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Category name is required")
      return
    }

    try {
      setLoading(true)

      await axios.put(updateCategory(category?.id || "").url, formData)

      setFormData({ name: "", desc: "" })
      onSuccess()
    } catch (error) {
      console.error("Error creating category:", error)
      alert("Failed to edit category")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Update Category</DialogTitle>
            <DialogDescription>
              Update data category
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <label htmlFor="name" className="text-sm">
                Category Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Enter category name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </Field>
            <Field>
              <label htmlFor="desc" className="text-sm">
                Description
              </label>
              <Textarea
                id="desc"
                name="desc"
                placeholder="Enter category description (optional)"
                value={formData.desc}
                onChange={handleChange}
                disabled={loading}
                rows={4}
              />
            </Field>
          </FieldGroup>
          <DialogFooter >
            <DialogClose asChild>
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

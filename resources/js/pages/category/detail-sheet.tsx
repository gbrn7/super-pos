import { Category } from "@/support/models/category"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DetailSheetProps {
  isOpen: boolean
  category: Category | null
  onOpenChange: (open: boolean) => void
}

export function DetailSheet({ isOpen, category, onOpenChange }: DetailSheetProps) {
  if (!category) return null

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Detail Kategori</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nama</p>
                <p className="text-base mt-1">{category.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
                <p className="text-base mt-1">{category.desc || "-"}</p>
              </div>

              {category.created_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dibuat Pada</p>
                  <p className="text-base mt-1">
                    {new Date(category.created_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              {category.updated_at && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Diubah Pada</p>
                  <p className="text-base mt-1">
                    {new Date(category.updated_at).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          <Button
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

# Design Spec: Toggle Password Visibility in Setup Wizard

## Overview
Menambahkan tombol/ikon mata (Eye/EyeOff) untuk melihat/menyembunyikan teks sandi pada field **Password** dan **Confirm Password** pada Langkah 3 (Akun Owner) Quick Setup Wizard.

## Proposed Changes

### Frontend (`resources/js/pages/setup/index.tsx`)
1. Import ikon `Eye` dan `EyeOff` dari `lucide-react`.
2. Menambahkan dua state boolean lokal:
   - `showPassword` (default `false`)
   - `showConfirmPassword` (default `false`)
3. Membungkus input password dengan kontainer `relative` dan menambahkan tombol toggle di sebelah kanan input:
   ```tsx
   <div className="relative">
       <Input type={showPassword ? 'text' : 'password'} ... />
       <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white" onClick={() => setShowPassword(!showPassword)}>
           {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
       </Button>
   </div>
   ```

## Testing & Verification
- Memastikan pengujian `SetupControllerTest` dan `EnsureAppIsNotInstalledTest` tetap lulus 100%.
- Memastikan `npm run build` sukses tanpa error.

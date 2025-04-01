import { useForm, Controller } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Product } from "@/api/types";

interface ProductFormProps {
  onSubmit: (data: Omit<Product, '_id'>) => Promise<void>;
  initialData?: Product;
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      quantity: 0,
      category: ""
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          {...register("name", { required: true })}
          placeholder="Enter product name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description", { required: true })}
          placeholder="Enter product description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            {...register("price", { required: true, min: 0 })}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            {...register("quantity", { required: true, min: 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Controller
          name="category"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vegetables">Vegetables</SelectItem>
                <SelectItem value="fruits">Fruits</SelectItem>
                <SelectItem value="dairy">Dairy</SelectItem>
                <SelectItem value="meat">Meat</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-sm text-red-500">Category is required</p>
        )}
      </div>

      <Button type="submit" className="w-full">
        {initialData ? 'Update Product' : 'Create Product'}
      </Button>
    </form>
  );
}
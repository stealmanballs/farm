"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Leaf, Plus, ShoppingCart, Store, Trash2, UserRoundPlus } from "lucide-react"

type ProfileType = "buyer" | "seller"

type BaseForm = {
  fullName: string
  email: string
  phone: string
  location: string
  notes: string
}

type BuyerForm = BaseForm & {
  purchaseFrequency: "weekly" | "biweekly" | "monthly" | "seasonal" | ""
  interests: string[]
  preferredContact: "email" | "phone" | "text" | ""
}

type SellerProduct = {
  id: string
  name: string
  price: string
  unit: string
  inventory: string
  image: string | null
  notes: string
}

type SellerForm = BaseForm & {
  farmName: string
  farmDescription: string
  primaryProducts: string
  fulfillment: "delivery" | "pickup" | "both" | ""
  minimumOrder: string
  products: SellerProduct[]
}


type SavedProfile = {
  id: string
  type: ProfileType
  createdAt: string
  data: BuyerForm | SellerForm
}

const createEmptyBuyerForm = (): BuyerForm => ({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  notes: "",
  purchaseFrequency: "",
  interests: [],
  preferredContact: "",
})

const createEmptySellerForm = (): SellerForm => ({
  fullName: "",
  email: "",
  phone: "",
  location: "",
  notes: "",
  farmName: "",
  farmDescription: "",
  primaryProducts: "",
  fulfillment: "",
  minimumOrder: "",
  products: [],
})

const createEmptySellerProduct = (): SellerProduct => ({
  id: newProfileId(),
  name: "",
  price: "",
  unit: "",
  inventory: "",
  image: null,
  notes: "",
})

const newProfileId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const buyerInterestOptions = [
  { value: "vegetables", label: "Vegetables & greens" },
  { value: "fruits", label: "Seasonal fruits" },
  { value: "herbs", label: "Fresh herbs" },
  { value: "eggs", label: "Eggs" },
  { value: "dairy", label: "Dairy & cheese" },
  { value: "meat", label: "Pasture-raised meat" },
  { value: "honey", label: "Honey & sweeteners" },
  { value: "baked-goods", label: "Baked goods" },
  { value: "flowers", label: "Flowers & plants" },
] as const;

const buyerInterestLabelMap = new Map(buyerInterestOptions.map((option) => [option.value, option.label]));

const formatBuyerInterests = (values: string[]) =>
  values.map((value) => buyerInterestLabelMap.get(value) ?? value).filter(Boolean);

const formatPreviewLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();


export default function Home() {
  const [profileType, setProfileType] = useState<ProfileType>("buyer")
  const [buyerForm, setBuyerForm] = useState<BuyerForm>(() => createEmptyBuyerForm())
  const [sellerForm, setSellerForm] = useState<SellerForm>(() => createEmptySellerForm())
  const [profiles, setProfiles] = useState<SavedProfile[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null)

  useEffect(() => {
    if (profileType === "seller" && sellerForm.products.length === 0) {
      setSellerForm((prev) => ({ ...prev, products: [createEmptySellerProduct()] }))
    }
  }, [profileType, sellerForm.products.length])

  const totals = useMemo(
    () =>
      profiles.reduce(
        (acc, profile) => {
          if (profile.type === "buyer") {
            acc.buyers += 1
          } else {
            acc.sellers += 1
          }
          return acc
        },
        { buyers: 0, sellers: 0 }
      ),
    [profiles]
  )

  const updateBuyer = <K extends keyof BuyerForm>(field: K, value: BuyerForm[K]) => {
    setBuyerForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateSeller = <K extends keyof SellerForm>(field: K, value: SellerForm[K]) => {
    setSellerForm((prev) => ({ ...prev, [field]: value }))
  }

  const setBuyerInterestChecked = (interest: string, checked: boolean) => {
    setBuyerForm((prev) => {
      const exists = prev.interests.includes(interest)

      if (checked) {
        if (exists) {
          return prev
        }

        return { ...prev, interests: [...prev.interests, interest] }
      }

      if (!exists) {
        return prev
      }

      return { ...prev, interests: prev.interests.filter((value) => value !== interest) }
    })
  }

  const clearBuyerInterests = () => {
    setBuyerForm((prev) => ({ ...prev, interests: [] }))
  }

  const addSellerProduct = () => {
    setSellerForm((prev) => ({ ...prev, products: [...prev.products, createEmptySellerProduct()] }))
    setError(null)
  }

  const updateSellerProduct = <K extends keyof SellerProduct>(
    productId: string,
    field: K,
    value: SellerProduct[K]
  ) => {
    setSellerForm((prev) => ({
      ...prev,
      products: prev.products.map((product) =>
        product.id === productId ? { ...product, [field]: value } : product
      ),
    }))
  }

  const removeSellerProduct = (productId: string) => {
    setSellerForm((prev) => {
      const remaining = prev.products.filter((product) => product.id !== productId)

      if (remaining.length === 0) {
        return { ...prev, products: [createEmptySellerProduct()] }
      }

      return { ...prev, products: remaining }
    })
    setError(null)
  }

  const handleSellerProductImageChange = (productId: string, files: FileList | null) => {
    if (!files || files.length === 0) {
      updateSellerProduct(productId, "image", null)
      return
    }

    const file = files.item(0)
    if (!file) {
      updateSellerProduct(productId, "image", null)
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        updateSellerProduct(productId, "image", reader.result)
      }
    }
    reader.readAsDataURL(file)
    setError(null)
  }

  const clearSellerProducts = () => {
    setSellerForm((prev) => ({ ...prev, products: [createEmptySellerProduct()] }))
    setError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (profileType === "buyer") {
      const requiredBuyerFields: Array<"fullName" | "email" | "location"> = [
        "fullName",
        "email",
        "location",
      ]
      const missingBuyerFields = requiredBuyerFields.filter((field) =>
        buyerForm[field].trim().length === 0
      )
      if (missingBuyerFields.length > 0) {
        setError("Please fill in the required buyer details.")
        return
      }

      const profileId = newProfileId()
      const entry: SavedProfile = {
        id: profileId,
        type: "buyer",
        createdAt: new Date().toLocaleString(),
        data: { ...buyerForm },
      }

      setProfiles((prev) => [entry, ...prev])
      setBuyerForm(createEmptyBuyerForm())
      setError(null)
      setLastCreatedId(profileId)
      return
    }

    const requiredSellerFields: Array<"fullName" | "email" | "location" | "farmName"> = [
      "fullName",
      "email",
      "location",
      "farmName",
    ]
    const missingSellerFields = requiredSellerFields.filter((field) =>
      sellerForm[field].trim().length === 0
    )
    if (missingSellerFields.length > 0) {
      setError("Please complete the required seller details.")
      return
    }

    if (sellerForm.products.length === 0) {
      setError("Please add at least one product to your catalog.")
      return
    }

    const incompleteProducts = sellerForm.products.filter((product) =>
      product.name.trim().length === 0 || product.price.trim().length === 0
    )
    if (incompleteProducts.length > 0) {
      setError("Please fill in a name and price for each product.")
      return
    }

    const invalidPriceProducts = sellerForm.products.filter((product) =>
      Number.isNaN(Number(product.price))
    )
    if (invalidPriceProducts.length > 0) {
      setError("Product prices must be numeric (examples: 4.99, 12, 2.5).")
      return
    }

    const sanitizedProducts = sellerForm.products.map((product) => ({
      ...product,
      name: product.name.trim(),
      price: product.price.trim(),
      unit: product.unit.trim(),
      inventory: product.inventory.trim(),
      notes: product.notes.trim(),
      image: product.image,
    }))

    const profileId = newProfileId()
    const entry: SavedProfile = {
      id: profileId,
      type: "seller",
      createdAt: new Date().toLocaleString(),
      data: { ...sellerForm, products: sanitizedProducts },
    }

    setProfiles((prev) => [entry, ...prev])
    setSellerForm(createEmptySellerForm())
    setError(null)
    setLastCreatedId(profileId)
  }

  const activeForm = profileType === "buyer" ? buyerForm : sellerForm

  const previewEntries = useMemo(() => {
    if (profileType === "buyer") {
      const entries: Array<{ key: string; label: string; value: string }> = []
      const push = (key: string, rawValue: string | null | undefined) => {
        const trimmed = (rawValue ?? "").toString().trim()
        if (trimmed.length === 0) {
          return
        }

        entries.push({
          key,
          label: formatPreviewLabel(key),
          value: trimmed,
        })
      }

      push("fullName", buyerForm.fullName)
      push("email", buyerForm.email)
      push("phone", buyerForm.phone)
      push("location", buyerForm.location)
      push("purchaseFrequency", buyerForm.purchaseFrequency)
      push("preferredContact", buyerForm.preferredContact)
      push("notes", buyerForm.notes)

      if (buyerForm.interests.length > 0) {
        const formatted = formatBuyerInterests(buyerForm.interests)
        if (formatted.length > 0) {
          entries.push({
            key: "interests",
            label: formatPreviewLabel("interests"),
            value: formatted.join(", "),
          })
        }
      }

      return entries
    }

    const entries: Array<{ key: string; label: string; value: string }> = []
    const push = (key: string, rawValue: string | null | undefined) => {
      const trimmed = (rawValue ?? "").toString().trim()
      if (trimmed.length === 0) {
        return
      }

      entries.push({
        key,
        label: formatPreviewLabel(key),
        value: trimmed,
      })
    }

    push("fullName", sellerForm.fullName)
    push("email", sellerForm.email)
    push("phone", sellerForm.phone)
    push("location", sellerForm.location)
    push("farmName", sellerForm.farmName)
    push("farmDescription", sellerForm.farmDescription)
    push("primaryProducts", sellerForm.primaryProducts)
    push("fulfillment", sellerForm.fulfillment)
    push("minimumOrder", sellerForm.minimumOrder)
    push("notes", sellerForm.notes)

    if (sellerForm.products.length > 0) {
      const summary = sellerForm.products
        .map((product) => {
          const name = product.name.trim() || "Unnamed product"
          const price = product.price.trim()
          const unit = product.unit.trim()
          const priceLabel =
            price.length > 0 ? "$" + price + (unit.length > 0 ? "/" + unit : "") : ""
          return priceLabel.length > 0 ? name + " (" + priceLabel + ")" : name
        })
        .join(", ")
        .trim()

      if (summary.length > 0) {
        entries.push({
          key: "products",
          label: formatPreviewLabel("products"),
          value: summary,
        })
      }
    }

    return entries
  }, [profileType, buyerForm, sellerForm])

  const selectedBuyerInterests = useMemo(
    () => formatBuyerInterests(buyerForm.interests),
    [buyerForm.interests]
  )
  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-green-50 to-white">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <header className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 md:text-4xl">
            Build Your Farm Marketplace Profile
          </h1>
          <p className="mt-3 text-base text-gray-600 md:text-lg">
            Choose whether you are here to buy or sell and create a profile that helps the community learn more about you.
          </p>
        </header>

        <main className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="backdrop-blur">
            <CardHeader>
              <CardTitle>Create a profile</CardTitle>
              <CardDescription>
                Select the profile type and fill in the details. Required fields are marked with an asterisk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label className="mb-2 block text-sm font-medium text-gray-700">I am joining as</Label>
                <RadioGroup
                  value={profileType}
                  onValueChange={(value) => {
                    setProfileType(value as ProfileType)
                    setError(null)
                  }}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  <div
                    className={`border-input hover:border-green-400 focus-within:border-green-500 focus-within:ring-green-200 group flex items-start gap-3 rounded-lg border bg-white/80 px-3 py-3 shadow-sm transition focus-within:ring-4 ${profileType === "buyer" ? "border-green-500 ring-2 ring-green-200" : ""}`}
                  >
                    <RadioGroupItem id="profile-buyer" value="buyer" className="mt-1" />
                    <Label htmlFor="profile-buyer" className="cursor-pointer space-y-1">
                      <span className="flex items-center gap-2 font-medium text-gray-900">
                        <ShoppingCart className="h-4 w-4 text-green-600" />
                        Buyer profile
                      </span>
                      <span className="text-sm text-gray-600">Find fresh produce and connect with farms.</span>
                    </Label>
                  </div>

                  <div
                    className={`border-input hover:border-green-400 focus-within:border-green-500 focus-within:ring-green-200 group flex items-start gap-3 rounded-lg border bg-white/80 px-3 py-3 shadow-sm transition focus-within:ring-4 ${profileType === "seller" ? "border-green-500 ring-2 ring-green-200" : ""}`}
                  >
                    <RadioGroupItem id="profile-seller" value="seller" className="mt-1" />
                    <Label htmlFor="profile-seller" className="cursor-pointer space-y-1">
                      <span className="flex items-center gap-2 font-medium text-gray-900">
                        <Store className="h-4 w-4 text-green-600" />
                        Seller profile
                      </span>
                      <span className="text-sm text-gray-600">Showcase your farm and products to buyers.</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name *</Label>
                    <Input
                      id="fullName"
                      value={activeForm.fullName}
                      placeholder="Alex Johnson"
                      onChange={(event) => {
                        if (profileType === "buyer") {
                          updateBuyer("fullName", event.target.value)
                        } else {
                          updateSeller("fullName", event.target.value)
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={activeForm.email}
                      placeholder="alex@example.com"
                      onChange={(event) => {
                        if (profileType === "buyer") {
                          updateBuyer("email", event.target.value)
                        } else {
                          updateSeller("email", event.target.value)
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={activeForm.phone}
                      placeholder="(555) 123-4567"
                      onChange={(event) => {
                        if (profileType === "buyer") {
                          updateBuyer("phone", event.target.value)
                        } else {
                          updateSeller("phone", event.target.value)
                        }
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">City or region *</Label>
                    <Input
                      id="location"
                      value={activeForm.location}
                      placeholder="Napa Valley, CA"
                      onChange={(event) => {
                        if (profileType === "buyer") {
                          updateBuyer("location", event.target.value)
                        } else {
                          updateSeller("location", event.target.value)
                        }
                      }}
                    />
                  </div>
                </div>

                {profileType === "buyer" ? (
                  <div className="space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>How often do you buy?</Label>
                        <Select
                          value={buyerForm.purchaseFrequency}
                          onValueChange={(value) => updateBuyer("purchaseFrequency", value as BuyerForm["purchaseFrequency"])}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose an option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Every two weeks</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="seasonal">Seasonally</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Preferred contact</Label>
                        <Select
                          value={buyerForm.preferredContact}
                          onValueChange={(value) => updateBuyer("preferredContact", value as BuyerForm["preferredContact"])}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a contact method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="phone">Phone call</SelectItem>
                            <SelectItem value="text">Text message</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="interests">What are you shopping for?</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="flex w-full items-center justify-between gap-2 text-left"
                          >
                            <span
                              className={
                                selectedBuyerInterests.length === 0
                                  ? "truncate text-sm text-muted-foreground"
                                  : "truncate text-sm text-gray-900"
                              }
                            >
                              {selectedBuyerInterests.length === 0
                                ? "Select all categories that match your interests"
                                : "Selected: " + selectedBuyerInterests.join(", ")}
                            </span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-72 space-y-3 p-4" align="start">
                          <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                            {buyerInterestOptions.map((option) => {
                              const checked = buyerForm.interests.includes(option.value)
                              return (
                                <div
                                  key={option.value}
                                  className="flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-800 transition hover:bg-green-50"
                                  onClick={() => setBuyerInterestChecked(option.value, !checked)}
                                >
                                  <span>{option.label}</span>
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(next) =>
                                      setBuyerInterestChecked(option.value, next === true)
                                    }
                                    onClick={(event) => event.stopPropagation()}
                                  />
                                </div>
                              )
                            })}
                          </div>
                          {buyerForm.interests.length > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="w-full justify-center text-xs text-green-700 hover:text-green-800"
                              onClick={clearBuyerInterests}
                            >
                              Clear selection
                            </Button>
                          )}
                        </PopoverContent>
                      </Popover>
                      {selectedBuyerInterests.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedBuyerInterests.map((label) => (
                            <Badge
                              key={`buyer-interest-${label}`}
                              variant="secondary"
                              className="bg-green-100 text-green-700"
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="farmName">Farm or business name *</Label>
                        <Input
                          id="farmName"
                          value={sellerForm.farmName}
                          placeholder="Sunny Acres Farm"
                          onChange={(event) => updateSeller("farmName", event.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="farmDescription">Short description</Label>
                        <Textarea
                          id="farmDescription"
                          rows={3}
                          placeholder="Family-run farm specializing in seasonal produce."
                          value={sellerForm.farmDescription}
                          onChange={(event) => updateSeller("farmDescription", event.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="primaryProducts">Primary products</Label>
                        <Textarea
                          id="primaryProducts"
                          rows={2}
                          placeholder="Heirloom tomatoes, mixed greens, fresh herbs"
                          value={sellerForm.primaryProducts}
                          onChange={(event) => updateSeller("primaryProducts", event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>How do you fulfill orders?</Label>
                        <Select
                          value={sellerForm.fulfillment}
                          onValueChange={(value) => updateSeller("fulfillment", value as SellerForm["fulfillment"])}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pickup">Local pickup</SelectItem>
                            <SelectItem value="delivery">Local delivery</SelectItem>
                            <SelectItem value="both">Pickup and delivery</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minimumOrder">Minimum order (optional)</Label>
                        <Input
                          id="minimumOrder"
                          value={sellerForm.minimumOrder}
                          placeholder="$50 order minimum"
                          onChange={(event) => updateSeller("minimumOrder", event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 rounded-xl border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <Label className="text-base font-semibold">Product catalog</Label>
                          <p className="text-sm text-gray-500">
                            Add each product you offer with pricing, inventory, and an optional photo.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={addSellerProduct}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add product
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={clearSellerProducts}>
                            Reset catalog
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {sellerForm.products.map((product, index) => (
                          <div key={product.id} className="space-y-4 rounded-lg border bg-white/60 p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-gray-700">Product {index + 1}</p>
                              {sellerForm.products.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => removeSellerProduct(product.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Remove product</span>
                                </Button>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`product-name-${product.id}`}>Product name *</Label>
                              <Input
                                id={`product-name-${product.id}`}
                                value={product.name}
                                placeholder="Heritage tomatoes"
                                onChange={(event) => updateSellerProduct(product.id, "name", event.target.value)}
                              />
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                              <div className="space-y-2">
                                <Label htmlFor={`product-price-${product.id}`}>Price *</Label>
                                <Input
                                  id={`product-price-${product.id}`}
                                  value={product.price}
                                  placeholder="4.50"
                                  onChange={(event) => updateSellerProduct(product.id, "price", event.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`product-unit-${product.id}`}>Unit</Label>
                                <Input
                                  id={`product-unit-${product.id}`}
                                  value={product.unit}
                                  placeholder="per lb"
                                  onChange={(event) => updateSellerProduct(product.id, "unit", event.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`product-inventory-${product.id}`}>Inventory</Label>
                                <Input
                                  id={`product-inventory-${product.id}`}
                                  value={product.inventory}
                                  placeholder="24 crates available"
                                  onChange={(event) => updateSellerProduct(product.id, "inventory", event.target.value)}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`product-image-${product.id}`}>Product photo</Label>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-white">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name ? `${product.name} preview` : `Product ${index + 1} preview`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs text-gray-500">No photo</span>
                                  )}
                                </div>
                                <Input
                                  id={`product-image-${product.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(event) => handleSellerProductImageChange(product.id, event.target.files)}
                                />
                              </div>
                              <p className="text-xs text-gray-500">JPEG or PNG up to 2 MB.</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`product-notes-${product.id}`}>Notes</Label>
                              <Textarea
                                id={`product-notes-${product.id}`}
                                rows={2}
                                placeholder="Harvest windows, packaging details, or pickup instructions"
                                value={product.notes}
                                onChange={(event) => updateSellerProduct(product.id, "notes", event.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes for the community</Label>
                  <Textarea
                    id="notes"
                    rows={3}
                    placeholder="Share any other details, requests, or helpful information."
                    value={activeForm.notes}
                    onChange={(event) => {
                      if (profileType === "buyer") {
                        updateBuyer("notes", event.target.value)
                      } else {
                        updateSeller("notes", event.target.value)
                      }
                    }}
                  />
                </div>

                {error && (
                  <p className="text-sm font-medium text-red-600" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Save profile
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (profileType === "buyer") {
                        setBuyerForm(createEmptyBuyerForm())
                      } else {
                        setSellerForm(createEmptySellerForm())
                      }
                      setError(null)
                    }}
                  >
                    Clear form
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle>Profile overview</CardTitle>
              <CardDescription>
                Track who has joined so far and preview the information you are about to save.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-lg border bg-gradient-to-r from-green-100 to-green-50 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-green-800">
                    <UserRoundPlus className="h-4 w-4" />
                    Total profiles
                  </span>
                  <Badge variant="secondary" className="bg-white text-green-700">
                    {profiles.length}
                  </Badge>
                </div>
                <div className="flex justify-between rounded-lg border px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">Buyers</span>
                  <span className="text-sm text-gray-600">{totals.buyers}</span>
                </div>
                <div className="flex justify-between rounded-lg border px-4 py-3">
                  <span className="text-sm font-medium text-gray-700">Sellers</span>
                  <span className="text-sm text-gray-600">{totals.sellers}</span>
                </div>
              </div>

              <Separator />

              <div>
                <h2 className="text-sm font-semibold text-gray-800">Live preview</h2>
                {previewEntries.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-600">
                    Start filling out the form to see a preview of your profile details.
                  </p>
                ) : (
                  <dl className="mt-3 space-y-2 text-sm">
                    {previewEntries.map((entry) => (
                      <div key={entry.key} className="flex flex-col rounded-md border bg-white px-3 py-2">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {entry.label}
                        </dt>
                        <dd className="text-gray-800">{entry.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recently created profiles</h2>
            {profiles.length > 0 && (
              <p className="text-sm text-gray-600">
                Showing {profiles.length} saved {profiles.length === 1 ? "profile" : "profiles"}.
              </p>
            )}
          </div>

          {profiles.length === 0 ? (
            <Card className="bg-white/70">
              <CardContent className="py-8 text-center text-sm text-gray-600">
                Profiles that you create will appear here. Add one using the form above to get started.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {profiles.map((profile) => {
                const data = profile.data
                const isBuyer = profile.type === "buyer"
                const buyerData = isBuyer ? (data as BuyerForm) : null
                const sellerData = !isBuyer ? (data as SellerForm) : null

                return (
                  <Card
                    key={profile.id}
                    className={`bg-white/90 transition ${profile.id === lastCreatedId ? "border-green-500 ring-2 ring-green-200" : ""}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            {data.fullName || "Unnamed profile"}
                          </CardTitle>
                          <CardDescription>
                            Added on {profile.createdAt}
                          </CardDescription>
                        </div>
                        <Badge className={isBuyer ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}>
                          {isBuyer ? "Buyer" : "Seller"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex justify-between text-gray-700">
                        <span>Email</span>
                        <span className="text-gray-900">{data.email || "�"}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Phone</span>
                        <span className="text-gray-900">{data.phone || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between text-gray-700">
                        <span>Location</span>
                        <span className="text-gray-900">{data.location || "Not provided"}</span>
                      </div>

                      {isBuyer && buyerData ? (
                        <>
                          <div className="flex justify-between text-gray-700">
                            <span>Frequency</span>
                            <span className="text-gray-900">{buyerData.purchaseFrequency || "Not provided"}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Contact</span>
                            <span className="text-gray-900">{buyerData.preferredContact || "Not provided"}</span>
                          </div>
                          <div className="text-gray-700">
                            <span className="font-medium text-gray-800">Interests</span>
                            {buyerData.interests.length === 0 ? (
                              <p className="mt-1 text-gray-900">No preferences shared yet.</p>
                            ) : (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {formatBuyerInterests(buyerData.interests).map((label) => (
                                  <Badge
                                    key={`${profile.id}-interest-${label}`}
                                    variant="secondary"
                                    className="bg-green-100 text-green-700"
                                  >
                                    {label}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      ) : null}

                      {!isBuyer && sellerData ? (
                        <>
                          <div className="flex justify-between text-gray-700">
                            <span>Farm name</span>
                            <span className="text-gray-900">{sellerData.farmName || "Not provided"}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Fulfillment</span>
                            <span className="text-gray-900">{sellerData.fulfillment || "Not provided"}</span>
                          </div>
                          <div className="text-gray-700">
                            <span className="font-medium text-gray-800">Primary products</span>
                            <p className="mt-1 text-gray-900">
                              {sellerData.primaryProducts || "No primary products shared yet."}
                            </p>
                          </div>
                          <div className="text-gray-700">
                            <span className="font-medium text-gray-800">Catalog</span>
                            {(sellerData.products?.length ?? 0) === 0 ? (
                              <p className="mt-1 text-gray-900">No products added yet.</p>
                            ) : (
                              <div className="mt-2 space-y-2">
                                {(sellerData.products ?? []).slice(0, 3).map((product) => {
                                  const displayPrice = product.price
                                    ? `$${product.price}${product.unit ? `/${product.unit}` : ""}`
                                    : null

                                  return (
                                    <div
                                      key={`${profile.id}-product-${product.id}`}
                                      className="flex items-center gap-3 rounded-md border bg-white/70 px-3 py-2"
                                    >
                                      {product.image ? (
                                        <img
                                          src={product.image}
                                          alt={product.name ? `${product.name} preview` : "Product preview"}
                                          className="h-10 w-10 rounded-md object-cover"
                                        />
                                      ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed text-[10px] text-gray-500">
                                          No photo
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">
                                          {product.name || "Unnamed product"}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {displayPrice ?? "Price TBD"}
                                          {product.inventory ? ` • ${product.inventory}` : ""}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })}
                                {(sellerData.products?.length ?? 0) > 3 && (
                                  <p className="text-xs text-gray-500">
                                    +{(sellerData.products?.length ?? 0) - 3} more products in catalog
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      ) : null}

                      {data.notes && (
                        <div className="text-gray-700">
                          <span className="font-medium text-gray-800">Notes</span>
                          <p className="mt-1 text-gray-900">{data.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

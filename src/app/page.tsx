"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Search, MapPin, Star, ShoppingCart } from "lucide-react"

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Mock data for demonstration
  const categories = [
    { id: "all", name: "All Products" },
    { id: "vegetables", name: "Vegetables" },
    { id: "fruits", name: "Fruits" },
    { id: "dairy", name: "Dairy" },
    { id: "meat", name: "Meat" },
    { id: "eggs", name: "Eggs" },
    { id: "baked", name: "Baked Goods" },
  ]

  const products = [
    {
      id: "1",
      name: "Organic Tomatoes",
      description: "Fresh, vine-ripened organic tomatoes",
      price: 4.99,
      unit: "lb",
      category: "vegetables",
      farm: "Green Valley Farm",
      farmImage: "/api/placeholder/40/40",
      image: "/api/placeholder/300/200",
      rating: 4.8,
      inStock: true,
      organic: true,
    },
    {
      id: "2",
      name: "Free Range Eggs",
      description: "Farm-fresh eggs from happy chickens",
      price: 6.50,
      unit: "dozen",
      category: "eggs",
      farm: "Sunny Side Farm",
      farmImage: "/api/placeholder/40/40",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      inStock: true,
      organic: true,
    },
    {
      id: "3",
      name: "Organic Apples",
      description: "Crisp, sweet organic apples",
      price: 3.99,
      unit: "lb",
      category: "fruits",
      farm: "Orchard Haven",
      farmImage: "/api/placeholder/40/40",
      image: "/api/placeholder/300/200",
      rating: 4.7,
      inStock: true,
      organic: true,
    },
    {
      id: "4",
      name: "Artisan Sourdough",
      description: "Handcrafted sourdough bread",
      price: 8.00,
      unit: "loaf",
      category: "baked",
      farm: "Rising Sun Bakery",
      farmImage: "/api/placeholder/40/40",
      image: "/api/placeholder/300/200",
      rating: 4.9,
      inStock: false,
      organic: false,
    },
  ]

  const featuredFarms = [
    {
      id: "1",
      name: "Green Valley Farm",
      description: "Family-owned organic farm since 1985",
      image: "/api/placeholder/200/150",
      rating: 4.8,
      products: 25,
      location: "Valley Springs, CA",
    },
    {
      id: "2",
      name: "Sunny Side Farm",
      description: "Sustainable farming practices",
      image: "/api/placeholder/200/150",
      rating: 4.9,
      products: 18,
      location: "Sunset Valley, CA",
    },
    {
      id: "3",
      name: "Orchard Haven",
      description: "Premium organic fruits and nuts",
      image: "/api/placeholder/200/150",
      rating: 4.7,
      products: 32,
      location: "Fruitland, CA",
    },
  ]

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Farm Direct Marketplace
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Connect directly with local organic farmers and get fresh produce delivered to your door
          </p>
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for fresh produce..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-gray-900"
              />
            </div>
            <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100">
              Search
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Farms */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Featured Farms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFarms.map((farm) => (
              <Card key={farm.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl text-green-600">🌱</div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold">{farm.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{farm.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{farm.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{farm.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{farm.products} products</span>
                    <Button variant="outline" size="sm">
                      View Farm
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Fresh Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl text-green-600">🥬</div>
                  </div>
                  <div className="absolute top-2 right-2">
                    <Button variant="ghost" size="sm" className="p-2">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-red-100 text-red-800">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={product.farmImage} />
                      <AvatarFallback>🌾</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-600">{product.farm}</span>
                  </div>
                  <h3 className="font-semibold mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    {product.organic && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Organic
                      </Badge>
                    )}
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{product.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-green-600">${product.price}</span>
                      <span className="text-sm text-gray-500">/{product.unit}</span>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!product.inStock}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Browse Products</h3>
              <p className="text-gray-600">Explore fresh, organic products from local farms in your area</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Place Order</h3>
              <p className="text-gray-600">Choose pickup or delivery options that work best for you</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy Freshness</h3>
              <p className="text-gray-600">Get farm-fresh products delivered or pick them up locally</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Farm Direct Marketplace</h3>
          <p className="mb-4">Connecting communities with fresh, local, organic produce</p>
          <div className="flex justify-center gap-4 text-sm">
            <span>🌱 100% Organic</span>
            <span>🚚 Local Delivery</span>
            <span>🏪 Farm Direct</span>
            <span>💰 7.5% Platform Fee</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
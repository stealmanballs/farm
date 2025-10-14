import { Prisma, PrismaClient, UserRole, Frequency, DeliveryType, OrderStatus, PaymentStatus, FulfillmentStatus, NotificationType, ProductCategory, ProductStatus, InventoryAdjustmentType, VerificationStatus, FarmStatus, FarmMediaType, CertificationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const toDecimal = (value: number | string) => new Prisma.Decimal(value);

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);
  const adminPasswordHash = await bcrypt.hash("admin123", 12);

  const [admin, consumerOne, consumerTwo] = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@farmdirect.test",
        hashedPassword: adminPasswordHash,
        role: UserRole.ADMIN,
        profile: {
          create: {
            displayName: "Marketplace Admin",
            firstName: "Avery",
            lastName: "Fields",
            city: "San Francisco",
            state: "CA",
            country: "USA",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "mia.consumer@farmdirect.test",
        hashedPassword: passwordHash,
        role: UserRole.CONSUMER,
        profile: {
          create: {
            displayName: "Mia Chen",
            firstName: "Mia",
            lastName: "Chen",
            phone: "+1-415-555-1201",
            addressLine1: "125 Market Street",
            city: "San Francisco",
            state: "CA",
            postalCode: "94105",
            country: "USA",
            latitude: toDecimal("37.7946"),
            longitude: toDecimal("-122.3999"),
          },
        },
        consumerProfile: {
          create: {
            defaultDeliveryType: DeliveryType.LOCAL_DELIVERY,
            defaultDeliveryInstructions: "Leave by the front porch and ring the bell.",
            defaultPaymentMethod: "card-visa",
            loyaltyStatus: "gold",
          },
        },
        preferences: {
          create: {
            dietaryRestrictions: { pescatarian: true },
            allergies: { peanuts: false },
            notificationPreferences: { email: true, sms: true, push: false },
            preferredDeliveryType: DeliveryType.LOCAL_DELIVERY,
            maxDeliveryRadiusKm: toDecimal("40"),
            promoOptIn: true,
            smsOptIn: true,
          },
        },
        cart: {
          create: {
            deliveryType: DeliveryType.LOCAL_DELIVERY,
            zipCodeOverride: "94105",
          },
        },
      },
    }),
    prisma.user.create({
      data: {
        email: "diego.consumer@farmdirect.test",
        hashedPassword: passwordHash,
        role: UserRole.CONSUMER,
        profile: {
          create: {
            displayName: "Diego Martinez",
            firstName: "Diego",
            lastName: "Martinez",
            phone: "+1-206-555-3344",
            addressLine1: "742 Pine Street",
            city: "Seattle",
            state: "WA",
            postalCode: "98101",
            country: "USA",
            latitude: toDecimal("47.6097"),
            longitude: toDecimal("-122.3331"),
          },
        },
        consumerProfile: {
          create: {
            defaultDeliveryType: DeliveryType.PICKUP,
            defaultDeliveryInstructions: "Call upon arrival.",
            defaultPaymentMethod: "wallet-balance",
            loyaltyStatus: "standard",
          },
        },
        preferences: {
          create: {
            dietaryRestrictions: { vegan: false },
            allergies: { dairy: true },
            notificationPreferences: { email: true, sms: false, push: true },
            preferredDeliveryType: DeliveryType.PICKUP,
            maxDeliveryRadiusKm: toDecimal("25"),
            promoOptIn: false,
          },
        },
        cart: {
          create: {
            deliveryType: DeliveryType.PICKUP,
            zipCodeOverride: "98101",
          },
        },
      },
    }),
  ]);

  const [farmerOneUser, farmerTwoUser] = await Promise.all([
    prisma.user.create({
      data: {
        email: "contact@hillsidegreens.farm",
        hashedPassword: passwordHash,
        role: UserRole.FARMER,
        profile: {
          create: {
            displayName: "Hillside Greens",
            firstName: "Lena",
            lastName: "Farmer",
            phone: "+1-707-555-2871",
            addressLine1: "890 Country Rd",
            city: "Napa",
            state: "CA",
            postalCode: "94558",
            country: "USA",
            latitude: toDecimal("38.2975"),
            longitude: toDecimal("-122.2869"),
          },
        },
        farmerProfile: {
          create: {
            farmName: "Hillside Greens Cooperative",
            verificationStatus: VerificationStatus.VERIFIED,
            verificationSubmittedAt: new Date(),
            businessRegistrationNumber: "CA-ORG-2023-091",
            taxId: "94-1234567",
            payoutEmail: "payout@hillsidegreens.farm",
            platformFeeAcknowledgedAt: new Date(),
          },
        },
      },
      include: {
        farmerProfile: true,
      },
    }),
    prisma.user.create({
      data: {
        email: "hello@riverbendproduce.farm",
        hashedPassword: passwordHash,
        role: UserRole.FARMER,
        profile: {
          create: {
            displayName: "Riverbend Produce",
            firstName: "Caleb",
            lastName: "Gardner",
            phone: "+1-971-555-8720",
            addressLine1: "512 Farmstead Ln",
            city: "Portland",
            state: "OR",
            postalCode: "97202",
            country: "USA",
            latitude: toDecimal("45.5122"),
            longitude: toDecimal("-122.6587"),
          },
        },
        farmerProfile: {
          create: {
            farmName: "Riverbend Produce",
            verificationStatus: VerificationStatus.PENDING,
            businessRegistrationNumber: "OR-FARM-2022-118",
            payoutEmail: "finance@riverbendproduce.farm",
          },
        },
      },
      include: {
        farmerProfile: true,
      },
    }),
  ]);

  const hillsideFarm = await prisma.farm.create({
    data: {
      farmerProfileId: farmerOneUser.farmerProfile!.id,
      name: "Hillside Greens",
      slug: "hillside-greens",
      headline: "Organic greens grown with regenerative practices",
      description:
        "Hillside Greens is a worker-owned co-op in Napa Valley growing leafy greens, microgreens, and seasonal produce.",
      story:
        "Our cooperative of five farmers lovingly tends diversified crops year-round with a focus on soil health.",
      phone: "+1-707-555-2871",
      email: "support@hillsidegreens.farm",
      website: "https://hillsidegreens.farm",
      supportEmail: "support@hillsidegreens.farm",
      addressLine1: "890 Country Rd",
      city: "Napa",
      state: "CA",
      postalCode: "94558",
      country: "USA",
      latitude: toDecimal("38.2979"),
      longitude: toDecimal("-122.2867"),
      shippingRadiusKm: toDecimal("120"),
      minOrderAmount: toDecimal("45"),
      pickupInstructions: "Park by the barn and call the number posted on the sign.",
      pickupSchedule: {
        monday: "10:00-16:00",
        wednesday: "10:00-16:00",
        saturday: "08:00-12:00",
      },
      deliveryNotes: "Local delivery within 25 miles every Tuesday and Friday.",
      tags: "organic,regenerative,greens",
      status: FarmStatus.ACTIVE,
      onboardingCompleted: true,
      heroImageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
      coverImageUrl: "https://images.unsplash.com/photo-1423483641154-5411ec9c0ddf",
      deliveryOptions: {
        create: [
          {
            type: DeliveryType.LOCAL_DELIVERY,
            name: "Local delivery (25 miles)",
            description: "Delivered in reusable chilled totes.",
            radiusKm: toDecimal("40"),
            fee: toDecimal("7.50"),
            minimumOrder: toDecimal("50"),
            schedule: { days: ["Tuesday", "Friday"], window: "14:00-18:00" },
            cutoffTime: "18:00",
          },
          {
            type: DeliveryType.PICKUP,
            name: "Farm pickup",
            description: "Pick up directly from the farm stand.",
            schedule: { days: ["Monday", "Wednesday", "Saturday"], window: "10:00-16:00" },
            cutoffTime: "06:00",
            isEnabled: true,
          },
          {
            type: DeliveryType.SHIPPING,
            name: "Overnight shipping (West Coast)",
            description: "Shipped with insulated packaging and ice packs.",
            radiusKm: toDecimal("120"),
            fee: toDecimal("18.00"),
            minimumOrder: toDecimal("75"),
            schedule: { carrier: "UPS", service: "Next Day Air Saver" },
          },
        ],
      },
      certifications: {
        create: [
          {
            name: "USDA Organic",
            issuer: "California Certified Organic Farmers",
            certificationNumber: "CCOF-OR-3412",
            issuedAt: new Date("2024-01-15"),
            expiresAt: new Date("2025-12-31"),
            status: CertificationStatus.ACTIVE,
          },
        ],
      },
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e",
            type: FarmMediaType.IMAGE,
            altText: "Lettuce rows at sunrise",
            sortOrder: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
            type: FarmMediaType.IMAGE,
            altText: "Farm team harvesting kale",
            sortOrder: 1,
          },
        ],
      },
    },
    include: {
      deliveryOptions: true,
    },
  });

  const riverbendFarm = await prisma.farm.create({
    data: {
      farmerProfileId: farmerTwoUser.farmerProfile!.id,
      name: "Riverbend Produce",
      slug: "riverbend-produce",
      headline: "Seasonal produce and pasture-raised eggs from the Willamette Valley",
      description:
        "Riverbend Produce specializes in heirloom vegetables, berries, and free-range eggs with year-round CSA shares.",
      story:
        "Located along the Willamette River, our farm has been family-operated for three generations focusing on sustainable practices.",
      phone: "+1-971-555-8720",
      email: "info@riverbendproduce.farm",
      website: "https://riverbendproduce.farm",
      addressLine1: "512 Farmstead Ln",
      city: "Portland",
      state: "OR",
      postalCode: "97202",
      country: "USA",
      latitude: toDecimal("45.4598"),
      longitude: toDecimal("-122.6391"),
      shippingRadiusKm: toDecimal("90"),
      minOrderAmount: toDecimal("35"),
      pickupInstructions: "Follow the gravel road to the red barn, pickup lockers on the left.",
      pickupSchedule: {
        thursday: "12:00-18:00",
        saturday: "09:00-14:00",
      },
      deliveryNotes: "CSA deliveries every Thursday to Portland metro area.",
      tags: "csa,berries,eggs,heirloom",
      status: FarmStatus.PENDING_REVIEW,
      onboardingCompleted: false,
      heroImageUrl: "https://images.unsplash.com/photo-1501707362533-0e7d35a1b9d8",
      coverImageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      deliveryOptions: {
        create: [
          {
            type: DeliveryType.LOCAL_DELIVERY,
            name: "CSA Delivery",
            description: "Weekly CSA delivery within Portland metro area.",
            radiusKm: toDecimal("35"),
            fee: toDecimal("5.00"),
            minimumOrder: toDecimal("30"),
            schedule: { day: "Thursday", window: "15:00-19:00" },
          },
          {
            type: DeliveryType.PICKUP,
            name: "Farmstand Pickup",
            description: "Order ahead and pickup from farm lockers.",
            schedule: { days: ["Thursday", "Saturday"], window: "09:00-18:00" },
          },
        ],
      },
      media: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
            type: FarmMediaType.IMAGE,
            altText: "Pasture with chickens",
            sortOrder: 0,
          },
        ],
      },
    },
    include: {
      deliveryOptions: true,
    },
  });

  const [greensMix, microgreens, eggs, berries] = await Promise.all([
    prisma.product.create({
      data: {
        farmId: hillsideFarm.id,
        name: "Chef's Market Greens Mix",
        slug: "chefs-market-greens",
        sku: "HG-GREENS-001",
        description: "A vibrant mix of baby lettuces, chard, kale, and tender herbs.",
        price: toDecimal("9.50"),
        unit: "bag (12 oz)",
        minOrderQuantity: 1,
        maxOrderQuantity: 10,
        stockQuantity: 120,
        leadTimeDays: 2,
        organic: true,
        seasonality: "Year-round",
        category: ProductCategory.VEGETABLES,
        status: ProductStatus.ACTIVE,
        tags: "greens,microgreens,organic",
        isFeatured: true,
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6",
              altText: "Close-up of salad greens",
              isPrimary: true,
              sortOrder: 0,
            },
          ],
        },
        inventoryAdjustments: {
          create: [
            {
              adjustmentType: InventoryAdjustmentType.RESTOCK,
              quantityChange: 150,
              note: "Initial harvest",
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        farmId: hillsideFarm.id,
        name: "Sunshine Microgreens",
        slug: "sunshine-microgreens",
        sku: "HG-MICRO-002",
        description: "Sunflower, broccoli, and radish shoots rich in nutrients.",
        price: toDecimal("6.75"),
        unit: "tray (6 oz)",
        stockQuantity: 80,
        leadTimeDays: 1,
        organic: true,
        category: ProductCategory.HERBS,
        status: ProductStatus.ACTIVE,
        tags: "microgreens,vegan",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
              altText: "Microgreens in tray",
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        farmId: riverbendFarm.id,
        name: "Pasture-Raised Eggs",
        slug: "pasture-raised-eggs",
        sku: "RB-EGGS-001",
        description: "One dozen multi-colored eggs from pasture-raised hens.",
        price: toDecimal("7.25"),
        unit: "dozen",
        stockQuantity: 60,
        leadTimeDays: 1,
        organic: false,
        category: ProductCategory.EGGS,
        status: ProductStatus.ACTIVE,
        tags: "eggs,pasture-raised",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1589923188900-064d4d7fac24",
              altText: "Carton of eggs",
              isPrimary: true,
            },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        farmId: riverbendFarm.id,
        name: "Jubilee Heirloom Berries",
        slug: "jubilee-heirloom-berries",
        sku: "RB-BERRY-003",
        description: "Mix of loganberries, marionberries, and tayberries.",
        price: toDecimal("12.00"),
        unit: "box (16 oz)",
        stockQuantity: 45,
        leadTimeDays: 2,
        organic: true,
        category: ProductCategory.FRUITS,
        status: ProductStatus.DRAFT,
        tags: "berries,seasonal",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc",
              altText: "Fresh berries assortment",
              isPrimary: true,
            },
          ],
        },
      },
    }),
  ]);

  const localDeliveryOption = hillsideFarm.deliveryOptions.find((option) => option.type === DeliveryType.LOCAL_DELIVERY)!;

  const orderOne = await prisma.order.create({
    data: {
      orderNumber: "FD-2025-10001",
      consumerId: consumerOne.id,
      status: OrderStatus.CONFIRMED,
      deliveryType: DeliveryType.LOCAL_DELIVERY,
      subtotal: toDecimal("22.00"),
      shippingTotal: toDecimal("7.50"),
      platformFee: toDecimal("1.65"),
      taxTotal: toDecimal("1.80"),
      discountTotal: toDecimal("0.00"),
      total: toDecimal("31.45"),
      notes: "Please include recipe card if available.",
      deliveryAddress: {
        street: consumerOne.profile?.addressLine1,
        city: consumerOne.profile?.city,
        state: consumerOne.profile?.state,
        postalCode: consumerOne.profile?.postalCode,
      },
      deliveryInstructions: "Leave by the front porch inside the blue cooler.",
      scheduledFor: new Date(),
      items: {
        create: [
          {
            productId: greensMix.id,
            farmId: hillsideFarm.id,
            deliveryOptionId: localDeliveryOption.id,
            quantity: 2,
            unitPrice: greensMix.price,
            lineTotal: toDecimal("19.00"),
            leadTimeDays: greensMix.leadTimeDays,
          },
          {
            productId: microgreens.id,
            farmId: hillsideFarm.id,
            deliveryOptionId: localDeliveryOption.id,
            quantity: 1,
            unitPrice: microgreens.price,
            lineTotal: microgreens.price,
          },
        ],
      },
      payments: {
        create: [
          {
            amount: toDecimal("31.45"),
            status: PaymentStatus.SUCCEEDED,
            provider: "stripe",
            method: "card",
            transactionReference: "pi_3OkjFZ02Jz1",
            processedAt: new Date(),
          },
        ],
      },
      fulfillments: {
        create: [
          {
            farmId: hillsideFarm.id,
            deliveryOptionId: localDeliveryOption.id,
            status: FulfillmentStatus.IN_TRANSIT,
            trackingNumber: "FDL-001239",
            carrier: "FarmDirectLocal",
            estimatedDelivery: new Date(Date.now() + 86400000),
          },
        ],
      },
    },
    include: {
      items: true,
    },
  });

  const orderTwo = await prisma.order.create({
    data: {
      orderNumber: "FD-2025-10002",
      consumerId: consumerTwo.id,
      status: OrderStatus.PENDING,
      deliveryType: DeliveryType.PICKUP,
      subtotal: toDecimal("14.50"),
      shippingTotal: toDecimal("0"),
      platformFee: toDecimal("1.09"),
      taxTotal: toDecimal("1.18"),
      discountTotal: toDecimal("2.50"),
      total: toDecimal("14.27"),
      notes: "Picking up Saturday morning.",
      items: {
        create: [
          {
            productId: eggs.id,
            farmId: riverbendFarm.id,
            deliveryOptionId: riverbendFarm.deliveryOptions[1].id,
            quantity: 2,
            unitPrice: eggs.price,
            lineTotal: toDecimal("14.50"),
            leadTimeDays: eggs.leadTimeDays,
          },
        ],
      },
    },
  });

  await prisma.cartItem.createMany({
    data: [
      {
        cartId: consumerOne.cart!.id,
        productId: greensMix.id,
        farmId: hillsideFarm.id,
        deliveryOptionId: localDeliveryOption.id,
        quantity: 1,
        unitPrice: greensMix.price,
        lineTotal: greensMix.price,
      },
      {
        cartId: consumerTwo.cart!.id,
        productId: eggs.id,
        farmId: riverbendFarm.id,
        deliveryOptionId: riverbendFarm.deliveryOptions[0].id,
        quantity: 1,
        unitPrice: eggs.price,
        lineTotal: eggs.price,
      },
    ],
  });

  await prisma.favoriteFarm.createMany({
    data: [
      {
        userId: consumerOne.id,
        farmId: hillsideFarm.id,
      },
      {
        userId: consumerOne.id,
        farmId: riverbendFarm.id,
      },
      {
        userId: consumerTwo.id,
        farmId: hillsideFarm.id,
      },
    ],
  });

  await prisma.favoriteProduct.createMany({
    data: [
      { userId: consumerOne.id, productId: greensMix.id },
      { userId: consumerOne.id, productId: microgreens.id },
      { userId: consumerTwo.id, productId: eggs.id },
    ],
  });

  await prisma.review.createMany({
    data: [
      {
        userId: consumerOne.id,
        farmId: hillsideFarm.id,
        rating: 5,
        title: "Incredible freshness",
        comment: "The greens stayed crisp for a full week. Loved the delivery presentation!",
        isVerifiedPurchase: true,
      },
      {
        userId: consumerOne.id,
        productId: greensMix.id,
        orderId: orderOne.id,
        rating: 5,
        title: "Restaurant-quality mix",
        comment: "Perfect blend of textures and flavors. Makes salad prep so easy.",
        isVerifiedPurchase: true,
      },
      {
        userId: consumerTwo.id,
        productId: eggs.id,
        rating: 4,
        comment: "Rich yolks and great color. Shells a bit fragile but still great.",
        isVerifiedPurchase: true,
      },
    ],
  });

  await prisma.message.createMany({
    data: [
      {
        consumerId: consumerOne.id,
        farmerId: farmerOneUser.id,
        senderId: consumerOne.id,
        farmId: hillsideFarm.id,
        orderId: orderOne.id,
        subject: "Cooking suggestions?",
        body: "Hi! Do you have recipe recommendations for the microgreens this week?",
      },
      {
        consumerId: consumerOne.id,
        farmerId: farmerOneUser.id,
        senderId: farmerOneUser.id,
        farmId: hillsideFarm.id,
        orderId: orderOne.id,
        subject: "Re: Cooking suggestions?",
        body: "Hi Mia! Try topping avocado toast or adding them to soba noodle bowls.",
        readAt: new Date(),
      },
      {
        consumerId: consumerTwo.id,
        farmerId: farmerTwoUser.id,
        senderId: consumerTwo.id,
        farmId: riverbendFarm.id,
        subject: "Pickup locker instructions",
        body: "Will the lockers be stocked by 9am Saturday?",
      },
    ],
  });

  await prisma.savedSearch.createMany({
    data: [
      {
        userId: consumerOne.id,
        name: "Organic berries within 50 miles",
        filters: { categories: ["FRUITS"], organic: true },
        latitude: toDecimal("37.7749"),
        longitude: toDecimal("-122.4194"),
        radiusKm: toDecimal("80"),
        isAutoNotify: true,
      },
      {
        userId: consumerTwo.id,
        name: "Egg subscriptions",
        filters: { categories: ["EGGS"], subscription: true },
        radiusKm: toDecimal("40"),
        isAutoNotify: false,
      },
    ],
  });

  const autoReorder = await prisma.autoReorderSetting.create({
    data: {
      userId: consumerOne.id,
      productId: greensMix.id,
      deliveryOptionId: localDeliveryOption.id,
      quantity: 2,
      frequency: Frequency.WEEKLY,
      nextOrderDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: "Keep deliveries on Tuesdays.",
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: consumerOne.id,
        type: NotificationType.ORDER_UPDATE,
        title: "Order confirmed",
        message: "Hillside Greens is preparing your order FD-2025-10001.",
        payload: { orderId: orderOne.id, status: OrderStatus.CONFIRMED },
      },
      {
        userId: consumerOne.id,
        type: NotificationType.REORDER_REMINDER,
        title: "Upcoming auto-reorder",
        message: "Your auto-reorder for Chef's Market Greens will process in 2 days.",
        payload: { autoReorderSettingId: autoReorder.id, productId: greensMix.id },
      },
      {
        userId: farmerOneUser.id,
        type: NotificationType.ORDER_UPDATE,
        title: "New order received",
        message: "You have a new delivery order FD-2025-10001 to fulfill.",
        payload: { orderId: orderOne.id },
      },
    ],
  });

  await prisma.inventoryAdjustment.create({
    data: {
      productId: greensMix.id,
      createdById: farmerOneUser.id,
      adjustmentType: InventoryAdjustmentType.SALE,
      quantityChange: -3,
      note: "Auto adjustment from order FD-2025-10001",
    },
  });

  await prisma.inventoryAdjustment.create({
    data: {
      productId: eggs.id,
      createdById: farmerTwoUser.id,
      adjustmentType: InventoryAdjustmentType.RESTOCK,
      quantityChange: 30,
      note: "Weekly egg collection",
    },
  });

  await prisma.message.create({
    data: {
      consumerId: consumerOne.id,
      farmerId: farmerOneUser.id,
      senderId: farmerOneUser.id,
      farmId: hillsideFarm.id,
      subject: "Subscription confirmation",
      body: "We've enabled your weekly greens auto-reorder. Let us know if you need to pause.",
      metadata: { autoReorderSettingId: autoReorder.id },
      readAt: new Date(),
    },
  });

  await prisma.autoReorderSetting.update({
    where: { id: autoReorder.id },
    data: {
      cartItems: {
        create: [
          {
            cartId: consumerOne.cart!.id,
            productId: greensMix.id,
            farmId: hillsideFarm.id,
            deliveryOptionId: localDeliveryOption.id,
            quantity: 2,
            unitPrice: greensMix.price,
            lineTotal: toDecimal("19.00"),
          },
        ],
      },
    },
  });

  await prisma.fulfillment.create({
    data: {
      orderId: orderTwo.id,
      farmId: riverbendFarm.id,
      deliveryOptionId: riverbendFarm.deliveryOptions[1].id,
      status: FulfillmentStatus.PREPARING,
      notes: "Packing order for Saturday pickup",
    },
  });

  console.log("Seed data created successfully.");
}

main()
  .catch((error) => {
    console.error("Seed error", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

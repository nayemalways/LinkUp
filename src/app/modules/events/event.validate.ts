import z from "zod";
import { EventStatus, EventVisibility, Featured } from "./event.interface";

// Coordinate schema
const coordSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Address schema
const addressSchema = z.object({
  city: z.string(),
  state: z.string(),
  postal: z.string(),
  country: z.string(),
});

export const eventCreateSchema = z.object({
  co_hosts: z
    .string({ message: "co_host must be string" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format!")
    .optional(),

  category: z.string({ message: "Category must be ObjectId string!" })
             .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format!"),

  reviews: z
            .string()
             .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format!")
            .optional(),

  title: z
    .string({ message: "Title must be string!" })
    .min(5, "Title must be minimum 5 characters!"),

  description: z
    .string({ message: "Description must be string!" })
    .min(5, "Description must be minimum 5 characters!")
    .max(500, "Description must be maximum 500 characters!"),

  images: z
    .array(z.string().url({ message: "Image must be a valid URL!" }))
    .nonempty("At least one image is required!"),

  venue: z.string({ message: "Venue must be string!" }),

  event_start: z.coerce.date({ message: "Event start must be a valid date!" }),
  event_end: z.coerce.date({ message: "Event end must be a valid date!" }),

  time_zone: z.string({ message: "Timezone must be string!" }),

  organization: z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId format!")
                .optional(),

  event_status: z.nativeEnum(EventStatus),
  featured: z.nativeEnum(Featured),

  price: z
    .number({ message: "Price must be number!" })
    .nonnegative("Price cannot be negative!"),

  max_attendence: z
    .number()
    .int()
    .positive("Max attendance must be positive!"),

  age_limit: z
    .number()
    .int()
    .nonnegative("Age limit must be positive number!"),

  avg_rating: z
    .number()
    .min(0)
    .max(5),

  visibility: z.nativeEnum(EventVisibility),

  coord: coordSchema,

  address: addressSchema,
});


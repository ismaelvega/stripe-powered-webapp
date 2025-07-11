```sql
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.courses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  title character varying NOT NULL,
  description character varying,
  price_cents numeric NOT NULL,
  updated_at timestamp without time zone NOT NULL,
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_payment_method_id text NOT NULL UNIQUE,
  card_brand character varying NOT NULL,
  last4 character varying NOT NULL,
  exp_month smallint NOT NULL,
  exp_year integer NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT payment_methods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  stripe_customer_id text NOT NULL UNIQUE,
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_courses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL UNIQUE,
  course_id bigint NOT NULL,
  progress_percent integer NOT NULL DEFAULT 0,
  status text DEFAULT 'in_progress'::text,
  purchased_at timestamp without time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  CONSTRAINT user_courses_pkey PRIMARY KEY (id),
  CONSTRAINT user_courses_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT user_courses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);```
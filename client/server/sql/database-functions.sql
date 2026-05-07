CREATE OR REPLACE FUNCTION get_restaurants()
RETURNS SETOF restaurants
LANGUAGE sql
AS $$
  SELECT *
  FROM restaurants
  ORDER BY restaurant_id ASC;
$$;

CREATE OR REPLACE FUNCTION get_menu_items(p_restaurant_id integer DEFAULT NULL)
RETURNS SETOF menu_items
LANGUAGE sql
AS $$
  SELECT *
  FROM menu_items
  WHERE p_restaurant_id IS NULL OR restaurant_id = p_restaurant_id
  ORDER BY item_id ASC;
$$;

CREATE OR REPLACE FUNCTION get_reviews()
RETURNS TABLE (
  review_id integer,
  customer_id integer,
  restaurant_id integer,
  courier_id integer,
  rating integer,
  comment text,
  username text
)
LANGUAGE sql
AS $$
  SELECT
    reviews.review_id,
    reviews.customer_id,
    reviews.restaurant_id,
    reviews.courier_id,
    reviews.rating,
    reviews.comment,
    users.username::text AS username
  FROM reviews
  LEFT JOIN customers ON reviews.customer_id = customers.customer_id
  LEFT JOIN users ON customers.user_id = users.user_id
  ORDER BY reviews.review_id DESC;
$$;

CREATE OR REPLACE FUNCTION create_review(
  p_customer_id integer,
  p_restaurant_id integer,
  p_courier_id integer,
  p_rating integer,
  p_comment text
)
RETURNS SETOF reviews
LANGUAGE sql
AS $$
  INSERT INTO reviews (customer_id, restaurant_id, courier_id, rating, comment)
  VALUES (p_customer_id, p_restaurant_id, p_courier_id, p_rating, p_comment)
  RETURNING *;
$$;

CREATE OR REPLACE FUNCTION authenticate_user(p_username text, p_password text)
RETURNS TABLE (user_id integer, username text, role_id integer)
LANGUAGE sql
AS $$
  SELECT users.user_id, users.username::text, users.role_id::integer
  FROM users
  WHERE users.username = p_username AND users.password = p_password;
$$;

CREATE OR REPLACE FUNCTION upsert_user_profile(
  p_user_id integer,
  p_username text,
  p_password text DEFAULT NULL,
  p_register boolean DEFAULT false
)
RETURNS TABLE (user_id integer, username text, role_id integer)
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_username IS NULL OR btrim(p_username) = '' THEN
    RAISE EXCEPTION 'Ім''я не вказано';
  END IF;

  IF p_register THEN
    IF EXISTS (SELECT 1 FROM users WHERE users.username = p_username) THEN
      RAISE EXCEPTION 'Цей логін уже зайнятий';
    END IF;

    RETURN QUERY
    INSERT INTO users (username, password, role_id)
    VALUES (p_username, p_password, 3)
    RETURNING users.user_id, users.username::text, users.role_id::integer;
  ELSE
    IF p_password IS NOT NULL AND btrim(p_password) <> '' THEN
      RETURN QUERY
      UPDATE users
      SET username = p_username, password = p_password
      WHERE users.user_id = p_user_id
      RETURNING users.user_id, users.username::text, users.role_id::integer;
    ELSE
      RETURN QUERY
      UPDATE users
      SET username = p_username
      WHERE users.user_id = p_user_id
      RETURNING users.user_id, users.username::text, users.role_id::integer;
    END IF;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_address(p_user_id integer)
RETURNS TABLE (address_id integer, address_text text)
LANGUAGE sql
AS $$
  SELECT addresses.address_id, addresses.address_text::text
  FROM customers
  JOIN addresses ON customers.address_id = addresses.address_id
  WHERE customers.user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION save_user_address(p_user_id integer, p_address_text text)
RETURNS TABLE (
  address_id integer,
  address_text text,
  customer_id integer,
  user_id integer
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_address addresses%ROWTYPE;
  v_customer customers%ROWTYPE;
BEGIN
  IF p_address_text IS NULL OR btrim(p_address_text) = '' THEN
    RAISE EXCEPTION 'Адреса не вказана';
  END IF;

  INSERT INTO addresses (address_text)
  VALUES (p_address_text)
  RETURNING * INTO v_address;

  INSERT INTO customers (user_id, address_id)
  VALUES (p_user_id, v_address.address_id)
  ON CONFLICT (user_id)
  DO UPDATE SET address_id = EXCLUDED.address_id
  RETURNING * INTO v_customer;

  RETURN QUERY SELECT
    v_address.address_id,
    v_address.address_text::text,
    v_customer.customer_id,
    v_customer.user_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_order_from_cart(
  p_user_id integer,
  p_restaurant_id integer,
  p_payment_method_id integer,
  p_items jsonb
)
RETURNS TABLE (order_id integer)
LANGUAGE plpgsql
AS $$
DECLARE
  v_customer_id integer;
  v_address_id integer;
  v_order orders%ROWTYPE;
  v_item jsonb;
BEGIN
  SELECT customers.customer_id, customers.address_id
  INTO v_customer_id, v_address_id
  FROM customers
  WHERE customers.user_id = p_user_id;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Спочатку додайте адресу в профілі';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Кошик порожній';
  END IF;

  INSERT INTO orders (customer_id, restaurant_id, address_id, payment_method_id, order_date)
  VALUES (v_customer_id, p_restaurant_id, v_address_id, p_payment_method_id, NOW())
  RETURNING * INTO v_order;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO order_items (order_id, item_id, quantity)
    VALUES (
      v_order.order_id,
      (v_item ->> 'item_id')::integer,
      (v_item ->> 'quantity')::integer
    );
  END LOOP;

  INSERT INTO deliveries (order_id, delivery_status)
  VALUES (v_order.order_id, 'created');

  UPDATE couriers
  SET is_available = false
  WHERE courier_id = (
    SELECT courier_id
    FROM deliveries
    WHERE deliveries.order_id = v_order.order_id
  );

  RETURN QUERY SELECT v_order.order_id;
END;
$$;

CREATE OR REPLACE FUNCTION get_orders_for_user(p_user_id integer)
RETURNS TABLE (
  order_id integer,
  customer_id integer,
  restaurant_id integer,
  address_id integer,
  payment_method_id integer,
  order_date timestamp,
  total_amount numeric,
  order_status text,
  restaurant_name text,
  method_name text,
  delivery_status text,
  courier_id integer,
  courier_name text
)
LANGUAGE sql
AS $$
  SELECT
    orders.order_id,
    orders.customer_id,
    orders.restaurant_id,
    orders.address_id,
    orders.payment_method_id,
    orders.order_date::timestamp,
    orders.total_amount::numeric,
    orders.order_status::text,
    restaurants.name::text AS restaurant_name,
    payment_methods.method_name::text,
    deliveries.delivery_status::text,
    deliveries.courier_id,
    users.username::text AS courier_name
  FROM orders
  LEFT JOIN restaurants ON orders.restaurant_id = restaurants.restaurant_id
  LEFT JOIN payment_methods ON orders.payment_method_id = payment_methods.payment_method_id
  LEFT JOIN deliveries ON deliveries.order_id = orders.order_id
  LEFT JOIN couriers ON deliveries.courier_id = couriers.courier_id
  LEFT JOIN users ON couriers.user_id = users.user_id
  WHERE
    (SELECT role_id FROM users WHERE users.user_id = p_user_id) = 1
    OR orders.customer_id IN (
      SELECT customer_id
      FROM customers
      WHERE customers.user_id = p_user_id
    )
  ORDER BY orders.order_date DESC;
$$;

CREATE OR REPLACE FUNCTION get_order_items(p_order_id integer)
RETURNS TABLE (
  order_id integer,
  item_id integer,
  quantity integer,
  name text,
  price numeric
)
LANGUAGE sql
AS $$
  SELECT
    order_items.order_id,
    order_items.item_id,
    order_items.quantity,
    menu_items.name::text,
    menu_items.price
  FROM order_items
  LEFT JOIN menu_items ON order_items.item_id = menu_items.item_id
  WHERE order_items.order_id = p_order_id;
$$;

CREATE OR REPLACE FUNCTION manage_order_action(
  p_action text,
  p_order_id integer DEFAULT NULL,
  p_status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  IF p_action = 'update_delivery_status' THEN
    UPDATE deliveries
    SET delivery_status = p_status
    WHERE deliveries.order_id = p_order_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Доставка для цього замовлення не знайдена';
    END IF;

    RETURN jsonb_build_object('message', 'Статус доставки оновлено');
  ELSIF p_action = 'update_order_status' THEN
    UPDATE orders
    SET order_status = p_status
    WHERE orders.order_id = p_order_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Замовлення не знайдено';
    END IF;

    RETURN jsonb_build_object('message', 'Статус замовлення оновлено');
  ELSIF p_action = 'delete_order' THEN
    UPDATE couriers
    SET is_available = true
    WHERE courier_id = (
      SELECT courier_id
      FROM deliveries
      WHERE deliveries.order_id = p_order_id
    );

    DELETE FROM deliveries WHERE deliveries.order_id = p_order_id;
    DELETE FROM order_items WHERE order_items.order_id = p_order_id;
    DELETE FROM orders WHERE orders.order_id = p_order_id;

    RETURN jsonb_build_object('message', 'Замовлення видалено');
  ELSIF p_action = 'delete_all_orders' THEN
    UPDATE couriers
    SET is_available = true
    WHERE courier_id IN (
      SELECT courier_id
      FROM deliveries
      WHERE courier_id IS NOT NULL
    );

    DELETE FROM deliveries;
    DELETE FROM order_items;
    DELETE FROM orders;

    RETURN jsonb_build_object('message', 'Усі замовлення видалено');
  END IF;

  RAISE EXCEPTION 'Невідома дія із замовленням';
END;
$$;
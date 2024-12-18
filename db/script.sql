CREATE FUNCTION public.set_account_number() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.account_number := NEXTVAL('account_number_seq')::VARCHAR;
    RETURN NEW;
END;
$$;

CREATE SEQUENCE public.account_number_seq
    START WITH 123000000
    INCREMENT BY 1
    MINVALUE 123000000
    NO MAXVALUE
    CACHE 1;


CREATE TABLE public.transactions (
    id bigint NOT NULL,
    wallet_id bigint NOT NULL,
    transaction_type character varying(20) NOT NULL,
    amount numeric(12,2) NOT NULL,
    recipient_wallet_id bigint,
    transaction_date timestamp without time zone DEFAULT now(),
    description text,
    CONSTRAINT transactions_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT transactions_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['top-up'::character varying, 'transfer'::character varying])::text[])))
);


CREATE SEQUENCE public.transactions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.users (
    email character varying(255) NOT NULL,
    username character varying(20) NOT NULL,
    fullname character varying(70) NOT NULL,
    password character varying(255) NOT NULL,
    avatar_url text NOT NULL,
    id bigint NOT NULL
);

CREATE SEQUENCE public.user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public.wallets_account_number_sec
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.wallets (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    account_number character varying(20) DEFAULT nextval('public.wallets_account_number_sec'::regclass) NOT NULL,
    balance numeric(12,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


CREATE SEQUENCE public.wallets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

INSERT INTO public.users (email, username, fullname, password, avatar_url, id) VALUES ('barbie123@gmail.com', 'Barbie', 'Barbie Doll', '$2b$10$O676hiV2OtxnkvEgyZ8NQuu.pdD/gK/BkEfo99Z5H2sD7HkkM9l8W', 'https://platform.polygon.com/wp-content/uploads/sites/2/chorus/uploads/chorus_asset/file/24795627/BarbieCU.jpeg?quality=90&strip=all&crop=22.804972804973,0,54.390054390054,100', 19);
INSERT INTO public.users (email, username, fullname, password, avatar_url, id) VALUES ('groot123@gmail.com', 'Groot', 'Groot the Guardian', '$2b$10$KUdKqCr06CN5iAgPhIwIr.Nl0NTyEyIYElLSEhVdvrHh/PaME6YhK', 'https://static.wikia.nocookie.net/guardiansofthegalaxymcu/images/b/bc/GrootGOTGV2.png', 20);

INSERT INTO public.wallets (id, user_id, account_number, balance, created_at, updated_at) VALUES (6, 19, '123000005', 0.00, '2024-12-18 13:20:56.526794', '2024-12-18 13:20:56.526794');
INSERT INTO public.wallets (id, user_id, account_number, balance, created_at, updated_at) VALUES (7, 20, '123000006', 0.00, '2024-12-18 13:23:18.890592', '2024-12-18 13:23:18.890592');


CREATE TRIGGER trigger_set_account_number BEFORE INSERT ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.set_account_number();

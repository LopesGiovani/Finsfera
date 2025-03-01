-- Verificar se a coluna já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'service_orders'
        AND column_name = 'customerId'
    ) THEN
        -- Adicionar a coluna customerId
        ALTER TABLE service_orders ADD COLUMN "customerId" INTEGER;
        
        -- Adicionar a restrição de chave estrangeira
        ALTER TABLE service_orders
        ADD CONSTRAINT fk_service_orders_customers
        FOREIGN KEY ("customerId") REFERENCES customers(id)
        ON DELETE SET NULL;
        
        RAISE NOTICE 'Coluna customerId adicionada com sucesso.';
    ELSE
        RAISE NOTICE 'A coluna customerId já existe na tabela service_orders.';
    END IF;
END
$$; 
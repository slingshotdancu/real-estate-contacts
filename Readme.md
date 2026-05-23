# Terminal 1 - API Server
cd real-estate-contacts
export $(grep -v '^#' .env | xargs)
pnpm --filter @workspace/api-server run dev

# Terminal 2 - Mobile App
cd real-estate-contacts
npx expo start --project-root artifacts/mobile

# How to check data
PGPASSWORD=devpassword123 psql -h localhost -U realestateuser -d realestate_contacts -c "SELECT * FROM contacts;"
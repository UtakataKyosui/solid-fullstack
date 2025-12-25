#!/bin/bash
# Script to replace auth lookups with hardcoded user_id=1 in location.rs and item.rs

for file in src/controllers/location.rs src/controllers/item.rs; do
    echo "Processing $file..."
    
    # Add user_id declaration after "// TODO" comments in function bodies
    sed -i '/TODO: Re-enable authentication/a\        let user_id = 1; // Temporary test user' "$file"
    
    # Replace auth.claims.pid lookups
    sed -i 's/let user = users::Model::find_by_pid(&ctx\.db, &auth\.claims\.pid)\.await?;//g' "$file"
    sed -i 's/user\.id/user_id/g' "$file"
    
    # Comment out users import
    sed -i 's/^\s*users,$/        \/\/ users,  \/\/ TODO: Re-enable when authentication is restored/' "$file"
done

echo "Done!"

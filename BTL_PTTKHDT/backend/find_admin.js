const supabase = require("./src/config/supabase");

async function findAdmin() {
  const { data, error } = await supabase
    .from("users")
    .select("email, role")
    .eq("role", "admin");

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log("Admin Users Found:");
  console.table(data);
}

findAdmin();

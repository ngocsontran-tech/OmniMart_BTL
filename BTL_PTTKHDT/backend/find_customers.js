const supabase = require("./src/config/supabase");

async function findCustomers() {
  const { data, error } = await supabase
    .from("users")
    .select("email, role")
    .eq("role", "customer")
    .limit(5);

  if (error) {
    console.error("Error:", error);
    return;
  }

  if (data.length === 0) {
    console.log("No customer users found.");
  } else {
    console.log("Customer Users Found:");
    console.table(data);
  }
}

findCustomers();

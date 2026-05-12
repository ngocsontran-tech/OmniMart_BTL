const supabase = require("./src/config/supabase");
const bcrypt = require("bcryptjs");

async function createCustomer() {
  const email = "customer@gmail.com";
  const password = "password123";
  const name = "Customer Demo";

  // Check if exists
  const { data: existedUser } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existedUser) {
    console.log(`User ${email} already exists.`);
    return;
  }

  const hash = await bcrypt.hash(password, 10);

  const { data: user, error } = await supabase
    .from("users")
    .insert({
      email: email,
      password: hash,
      name: name,
      role: "customer",
      is_active: true,
    })
    .select("id, email, name, role")
    .single();

  if (error) {
    console.error("Error creating user:", error);
  } else {
    console.log("Customer User Created Successfully:");
    console.table([user]);
    console.log(`Password: ${password}`);
  }
}

createCustomer();

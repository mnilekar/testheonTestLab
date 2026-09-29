import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defaultSeed, fixtureVersion } from '../contract.mjs';

function mulberry32(seed) {
  let value = seed >>> 0;
  return () => {
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(values, index, random) {
  return values[(index + Math.floor(random() * values.length)) % values.length];
}

function id(prefix, index) {
  return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

const firstNames = [
  'Rahul',
  'Aarav',
  'Priya',
  'Meera',
  'Ishaan',
  'Ananya',
  'Kabir',
  'Saanvi',
  'Arjun',
  'Nisha',
  'Zoë',
  'José',
  '李',
  'Fatima',
  'Noah',
  'Aditi',
];
const lastNames = [
  'Sharma',
  'Iyer',
  'Patel',
  'Mukherjee',
  'Fernandes',
  'Khan',
  'Rao',
  'Das',
  'Singh',
  'Mehta',
  'García',
  '王',
];
const cities = ['Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'];
const departments = [
  'Engineering',
  'Quality Assurance',
  'Product',
  'Design',
  'Finance',
  'People Operations',
  'Customer Success',
  'Security',
];
const locations = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Remote',
];
const categories = [
  'Electronics',
  'Home',
  'Books',
  'Fitness',
  'Beauty',
  'Travel',
];

function personName(index, random) {
  if (index === 7) {
    return 'Aaradhya Mahalakshmi Venkatanarasimharaju Subramanian';
  }
  return `${pick(firstNames, index, random)} ${pick(lastNames, index * 3, random)}`;
}

export function buildSeed(seed = defaultSeed) {
  const random = mulberry32(seed);
  const users = Array.from({ length: 40 }, (_, index) => {
    const name =
      index < 4 ? `Rahul ${lastNames[index]}` : personName(index, random);
    return {
      id: id('usr', index),
      name,
      email: `${
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '.')
          .replace(/^\.|\.$/g, '') || `user${index + 1}`
      }@example.test`,
      role: pick(['learner', 'trainer', 'reviewer'], index, random),
      active: index % 9 !== 0,
      ...(index === 39
        ? {
            email: 'marked-invalid-email',
            fixture: {
              intentionallyInvalid: true,
              reason: 'invalid-email-validation-practice',
            },
          }
        : {}),
    };
  });

  const customers = Array.from({ length: 60 }, (_, index) => ({
    id: id('cus', index),
    name: personName(index + 20, random),
    email: `customer.${index + 1}@example.test`,
    city: cities[index % cities.length],
    tier: pick(['standard', 'silver', 'gold'], index, random),
    active: index % 11 !== 0,
  }));

  const employees = Array.from({ length: 120 }, (_, index) => {
    const department = departments[index % departments.length];
    const name =
      index < 8
        ? `Rahul ${lastNames[index % lastNames.length]}`
        : personName(index + 40, random);
    return {
      id: id('emp', index),
      name,
      department,
      location: locations[index % locations.length],
      title: pick(
        [
          'Engineer',
          'QA Analyst',
          'Manager',
          'Specialist',
          'Coordinator',
          'Architect',
        ],
        index,
        random,
      ),
      active: index % 13 !== 0,
    };
  });

  const products = Array.from({ length: 80 }, (_, index) => ({
    id: id('prd', index),
    name: `${categories[index % categories.length]} product ${index + 1}`,
    sku: `SKU-${String(index + 1).padStart(4, '0')}`,
    category: categories[index % categories.length],
    price: 199 + ((index * 137) % 24_000),
    stock: index % 12 === 0 ? 0 : (index * 7) % 90,
    rating: Number((2.5 + ((index * 17) % 25) / 10).toFixed(1)),
    currency: 'INR',
  }));

  const orders = Array.from({ length: 150 }, (_, index) => {
    const first = products[(index * 3) % products.length];
    const second = products[(index * 3 + 5) % products.length];
    const items = [
      { productId: first.id, quantity: 1 + (index % 3), price: first.price },
      { productId: second.id, quantity: 1, price: second.price },
    ];
    return {
      id: id('ord', index),
      customerId: customers[index % customers.length].id,
      status:
        index % 10 === 0
          ? 'cancelled'
          : pick(['pending', 'paid', 'shipped', 'delivered'], index, random),
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      items,
      createdAt: new Date(Date.UTC(2026, 0, 1 + (index % 180))).toISOString(),
    };
  });

  const tasks = Array.from({ length: 50 }, (_, index) => ({
    id: id('tsk', index),
    title: `Practice task ${index + 1}`,
    status: pick(['todo', 'in-progress', 'done'], index, random),
    priority: pick(['low', 'medium', 'high'], index, random),
    assigneeId: employees[index % employees.length].id,
    dueDate: new Date(Date.UTC(2026, 6, 1 + (index % 28)))
      .toISOString()
      .slice(0, 10),
  }));

  const tickets = Array.from({ length: 60 }, (_, index) => ({
    id: id('tkt', index),
    subject: `Synthetic support ticket ${index + 1}`,
    status: pick(['open', 'pending', 'resolved'], index, random),
    priority: pick(['low', 'medium', 'high', 'urgent'], index, random),
    customerId: customers[index % customers.length].id,
    assigneeId: employees[(index * 2) % employees.length].id,
  }));

  const bookings = Array.from({ length: 40 }, (_, index) => ({
    id: id('bkg', index),
    guestName: personName(index + 75, random),
    city: cities[index % cities.length],
    checkIn: new Date(Date.UTC(2026, 9, 1 + index)).toISOString().slice(0, 10),
    checkOut: new Date(Date.UTC(2026, 9, 3 + index)).toISOString().slice(0, 10),
    status:
      index % 9 === 0
        ? 'cancelled'
        : pick(['confirmed', 'checked-in', 'completed'], index, random),
    total: 2400 + ((index * 613) % 18_000),
  }));

  return {
    metadata: {
      fixtureVersion,
      seed,
      generatedAt: '2026-09-27T00:00:00.000Z',
      currency: 'INR',
      synthetic: true,
    },
    data: {
      users,
      customers,
      employees,
      products,
      orders,
      tasks,
      tickets,
      bookings,
    },
  };
}

export function serializeSeed(seed = buildSeed()) {
  return `${JSON.stringify(seed, null, 2)}\n`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const output = fileURLToPath(new URL('./fixtures-v1.json', import.meta.url));
  await writeFile(output, serializeSeed(), 'utf8');
  console.log(`Deterministic fixture ${fixtureVersion} written to ${output}.`);
}

import fixtureData from '../../api/seed/fixtures-v1.json';

export interface ApiEmployee {
  id: string;
  name: string;
  department: string;
  location: string;
  title: string;
  active: boolean;
}

export interface EmployeeRow extends ApiEmployee {
  salary: number;
  joiningDate: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const data = fixtureData.data as {
  employees: ApiEmployee[];
  products: ApiProduct[];
};

export const seedEmployees = data.employees;
export const seedProducts = data.products;

export function employeeNumber(id: string): number {
  return Number(id.match(/\d+/)?.[0] ?? 0);
}

export function enrichEmployee(employee: ApiEmployee): EmployeeRow {
  const sequence = employeeNumber(employee.id);
  const salary = 45_000 + ((sequence * 7_913) % 85_000);
  const year = 2017 + (sequence % 9);
  const month = String((sequence % 12) + 1).padStart(2, '0');
  const day = String((sequence % 27) + 1).padStart(2, '0');
  return {
    ...employee,
    salary: Math.round(salary / 100) * 100,
    joiningDate: `${year}-${month}-${day}`,
  };
}

export function formatSalary(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function virtualEmployee(index: number): EmployeeRow {
  const sequence = index + 1;
  const departments = [
    'Engineering',
    'Quality Assurance',
    'Product',
    'Design',
    'Finance',
  ];
  const locations = ['Pune', 'Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad'];
  return enrichEmployee({
    id: `vemp-${String(sequence).padStart(5, '0')}`,
    name: `Virtual Tester ${String(sequence).padStart(5, '0')}`,
    department: departments[index % departments.length] ?? 'Engineering',
    location: locations[index % locations.length] ?? 'Pune',
    title: index % 3 === 0 ? 'QA Engineer' : 'Automation Engineer',
    active: index % 7 !== 0,
  });
}

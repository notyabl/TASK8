with(LinearAlgebra):
A := Matrix([[1, -2, 0],
             [3,  5, -7],
             [-4, 1,  2]]):
AAT := A . Transpose(A);
ATA := Transpose(A) . A;
# Проверка на равенство
evalb(AAT = ATA);



int((1+ln(x-1))/(x-1), x = exp(1)+1 .. exp(1)+1);


z := ln(tan(x/y));
diff(z, x);
diff(z, y);



limit((1 - cos(2*x))/(cos(7*x) - cos(3*x)), x=0);
# Если нужны односторонние:
limit((1 - cos(2*x))/(cos(7*x) - cos(3*x)), x=0, left);
limit((1 - cos(2*x))/(cos(7*x) - cos(3*x)), x=0, right);



ode := 2*(diff(y(x), x) + x*y(x)) = (1+x)*exp(-x)*y(x)^2;
ic  := y(0) = 2;
dsolve({ode, ic}, y(x));




plot(arctan((sin(x)+cos(x))/sqrt(2)), x = -2*Pi .. 2*Pi);




with(plots):
polarplot(arctan((sin(theta)+cos(theta))/sqrt(2)), theta = 0 .. 2*Pi);

import { Menu } from '~/components/menu';

interface AppBarProps {
  children: React.ReactNode;
}

export function AppBar({ children }: AppBarProps) {
  return (
    <div className="bg-slate-700">
      <div className="align-center container mx-auto flex flex-wrap justify-between">
        <div className="align-center flex">
          <Menu>{children}</Menu>
        </div>
      </div>
    </div>
  );
}

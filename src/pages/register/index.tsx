import { useState } from 'react';
import { Footer } from '~/components/layout';
import { Button, Input } from '~/components/ui';

const RegisterPage = () => {
  const [user, setUser] = useState<string>('');
  const [pass, setPass] = useState<string>('');
  const [activation, setActivation] = useState<string>('');
  function userChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUser(e.target.value);
  }

  function passChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPass(e.target.value);
  }
  function activationChange(e: React.ChangeEvent<HTMLInputElement>) {
    setActivation(e.target.value);
  }

  return (
    <div className="flex flex-col h-screen mx-8">
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <h2 className="text-4xl">Register</h2>
          <form
            className="flex flex-col space-y-4 w-64"
            // onSubmit={handleSubmit}
          >
            <Input
              type="text"
              name="username"
              onChange={userChange}
              placeholder="Username"
              className="outline-hidden focus:outline-hidden"
            />
            <Input
              type="password"
              name="password"
              onChange={passChange}
              placeholder="Password"
              className="outline-hidden focus:outline-hidden"
            />
            <Input
              type="text"
              name="activation"
              onChange={activationChange}
              placeholder="Activation Code"
              className="outline-hidden focus:outline-hidden"
            />
            <Button type="submit">Register</Button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;

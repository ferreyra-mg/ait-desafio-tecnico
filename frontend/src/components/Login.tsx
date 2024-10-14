import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";

export function Login({ onSubmit }: { onSubmit: SubmitHandler<{ user: string; password: string }> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ user: string; password: string }>();

  return (
    <div className="bg-white px-8 py-32 rounded-lg shadow-md w-96">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
          <input
            type="text"
            id="email"
            {...register("user", {
              required: "User is required",
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            autoComplete="off"
          />
          {errors.user && <p className="text-red-500 text-xs mt-1">{errors.user.message as string}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password:</label>
          <input
            type="password"
            id="password"
            {...register("password", {
              required: "Password is required",
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            autoComplete="off"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">Login</button>
      </form>
    </div>
  )
}
// Partner/Volunteer Sign-Up
export function JoinNetworkForm() {
  return (
    <section id="join-network" className="py-20 bg-orange-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Join Our Network
        </h2>
        <form className="bg-white rounded-2xl shadow p-8 space-y-6">
          <div>
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              className="w-full border rounded px-4 py-2"
              placeholder="Your Name"
              disabled
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full border rounded px-4 py-2"
              placeholder="you@email.com"
              disabled
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <select className="w-full border rounded px-4 py-2" disabled>
              <option>Volunteer</option>
              <option>NGO</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Message
            </label>
            <textarea
              className="w-full border rounded px-4 py-2"
              rows={3}
              placeholder="Tell us why you want to join..."
              disabled
            />
          </div>
          <button
            type="submit"
            className="w-full bg-orange-500 text-white font-bold py-2 px-4 rounded"
            disabled
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
}

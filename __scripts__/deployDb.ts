import Db from '../lib/db';

(async () => {
    await Db.openConnection(true);
    await Db.populateInitialData();
    await Db.closeConnection();
    process.exit(0);
})();

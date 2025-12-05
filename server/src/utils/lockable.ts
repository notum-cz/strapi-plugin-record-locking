const isCollectionLockable = (collection: string) => {
    const include: string[] | undefined = strapi.plugin('record-locking').config('include');
    const exclude: string[] | undefined = strapi.plugin('record-locking').config('exclude');
  
    if (include && exclude) {
      console.warn('Both include and exclude cannot be used together for record-locking, ignoring exclude configuration.');
    }

    if (include) {
        return include.includes(collection);
    }
      
    if (exclude) {
        return !exclude.includes(collection);
    }
      
    return true;
}

export {
    isCollectionLockable,
};